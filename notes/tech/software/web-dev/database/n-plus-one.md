# N+1 Query Problem

## Table of Contents

- [What It Is](#what-it-is)
- [Example](#example)
- [Fixes](#fixes)
- [Spotting It](#spotting-it)
- [Across Services](#across-services)

## What It Is

One query fetches a list of N items, then N more queries each fetch something related to a single item, for N + 1 queries in total. Each query is cheap on its own, but every one is a network round trip, so latency and database load grow linearly with the list size. It is common with ORMs, where lazy-loaded relations hide the extra queries behind plain property access.

## Example

Loading 100 posts with their authors:

```sql
-- 1 query for the list
SELECT * FROM posts LIMIT 100;

-- then 1 query per post: 100 more
SELECT * FROM users WHERE id = 1;
SELECT * FROM users WHERE id = 2;
-- ...
```

## Fixes

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

## Spotting It

- Query logs show the same statement repeated with different ids.
- Request latency grows with the number of rows returned.
- Many ORMs and APM tools can log a per-request query count; a test that asserts a maximum query count catches regressions.

## Across Services

The same shape appears over the network: a client fetches a list from one API, then calls another API once per item. The fixes are analogous, such as a batch endpoint that accepts many ids, or an endpoint that returns the related data inline. See [Service Communication](../service-communication.md) for how services talk to each other.
