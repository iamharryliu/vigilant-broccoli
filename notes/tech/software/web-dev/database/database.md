# Database

## Table of Contents

- [Databases](#databases)
- [Relational vs Non-Relational](#relational-vs-non-relational)
- [Practices](#practices)
  - [ACID](#acid)
  - [Normalization](#normalization)
- [N+1 Query Problem](#n1-query-problem)
  - [Example](#example)
  - [Fixes](#fixes)
  - [Spotting It](#spotting-it)
  - [Across Services](#across-services)

## Databases

- [SQL](./sql.md)
  - [Postgres](./postgres.md)
    - [Supabase](./supabase.md)
  - [SQLite3](./sqlite3.md)
- NoSQL
  - [MongoDB](./mongodb.md)

## Relational vs Non-Relational

Relational databases store data in tables with a fixed schema and link rows through keys and joins. Non-relational (NoSQL) databases trade that structure for flexible schemas and easier horizontal scaling, in several data models.

| Type | Data model | Transactions and scaling | Examples | Use when |
| :-- | :-- | :-- | :-- | :-- |
| Relational (SQL) | Tables with a fixed schema, linked by foreign keys and joins | ACID across tables; scales vertically first | PostgreSQL, MySQL, SQLite | Structured data, complex queries, joins, strong consistency |
| Non-Relational (NoSQL) | Document, key-value, wide-column or graph; flexible, often denormalized | Often per document or key, eventually consistent; scales horizontally | MongoDB (document), Redis (key-value), Cassandra (wide-column), Neo4j (graph) | Changing schemas, massive scale, simple key-based access, hierarchical or graph data |

## Practices

### ACID

ACID is the set of guarantees a transaction gives, so a group of changes either fully succeeds or leaves no trace.

| Property | Meaning | Example |
| :-- | :-- | :-- |
| Atomicity | All operations in a transaction succeed, or none are applied | A transfer never debits one account without crediting the other |
| Consistency | A transaction moves the database between valid states, respecting constraints | A foreign key or unique constraint violation rolls the transaction back |
| Isolation | Concurrent transactions do not see each other's partial work | Two buyers cannot both claim the last item in stock |
| Durability | Once committed, changes survive crashes and power loss | A committed order is still there after a restart |

### Normalization

Normalization organizes tables so each fact is stored once, which avoids update, insert and delete anomalies. Each normal form builds on the previous one. Denormalization reverses it on purpose, duplicating data to avoid joins on read-heavy paths, at the cost of keeping copies in sync.

| Normal form | Rule | Violation example |
| :-- | :-- | :-- |
| 1NF | Each column holds one atomic value and rows have no repeating groups | A `phones` column holding `"555-1234, 555-9876"` |
| 2NF | 1NF, and every non-key column depends on the whole primary key | In an order-items table keyed by order and product, `customer_name` depends only on the order |
| 3NF | 2NF, and non-key columns depend only on the key, not on other columns | `zip_code` and `city` both stored, where `city` follows from `zip_code` |
| BCNF | 3NF, and every determinant is a candidate key | A non-key column that determines part of the key |

## N+1 Query Problem

One query fetches a list of N items, then N more queries each fetch something related to a single item, for N + 1 queries in total. Each query is cheap on its own, but every one is a network round trip, so latency and database load grow linearly with the list size. It is common with ORMs, where lazy-loaded relations hide the extra queries behind plain property access.

### Example

Loading 100 posts with their authors:

```sql
-- 1 query for the list
SELECT * FROM posts LIMIT 100;

-- then 1 query per post: 100 more
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE id = 2;
-- ...
```

### Fixes

| Fix | How it works | Trade-off |
| --- | --- | --- |
| Batch with `IN` | Collect the ids, run one `WHERE id IN (...)` query, and match results in memory | Two queries instead of one, and very large id lists need chunking |
| Batching loader | A DataLoader-style helper collects lookups made in the same tick into one batch query | Extra abstraction; most useful for GraphQL resolvers |
| Eager loading | Ask the ORM to load the relation up front (for example `include` or `joinedload`) | Can over-fetch when the relation is not always needed |
| Join | Fetch posts and authors in a single `JOIN` query | Repeats parent columns per child row, and wide joins can be slow |
| Denormalize or cache | Store the needed field on the parent row or cache the lookup | The copy can go stale, so it needs an invalidation or update strategy |

```sql
-- Join: 1 query
SELECT posts.*, users.name
FROM posts
JOIN users ON users.id = posts.author_id
LIMIT 100;

-- Batch: 2 queries
SELECT * FROM posts LIMIT 100;
SELECT * FROM users WHERE id IN (1, 2, 3 /* ... distinct author ids */);
```

### Spotting It

- Query logs show the same statement repeated with different ids.
- Request latency grows with the number of rows returned.
- Many ORMs and APM tools can log a per-request query count; a test that asserts a maximum query count catches regressions.

### Across Services

The same shape appears over the network: a client fetches a list from one API, then calls another API once per item. The fixes are analogous, such as a batch endpoint that accepts many ids, or an endpoint that returns the related data inline. See [Service Communication](../service-communication.md) for how services talk to each other.
