# Software Products

## Table of Contents

- [Data Processing](#data-processing)
- [Databases](#databases)

## Data Processing

| Product | What it is                                                                                                       | Status                                                                                                                                                                                                                                                                                    |
| :------ | :--------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hadoop  | Open-source framework for distributed storage (HDFS), batch processing (MapReduce) and cluster scheduling (YARN) | Largely legacy for new projects. MapReduce writes to disk between steps, so it is slow, and HDFS ties storage to compute and needs cluster operations that managed cloud services remove. Replaced by Spark for processing, S3 or GCS for storage, and BigQuery, Snowflake or Databricks. |

## Databases

| Product    | What it is                                                                                   | Status                                                                                                                                      |
| :--------- | :------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| MariaDB    | Community fork of MySQL created by its original developers after Oracle acquired MySQL       | Active. Largely MySQL-compatible, but the two are diverging, so it is no longer a guaranteed drop-in replacement.                           |
| MongoDB    | Document database that stores JSON-like (BSON) documents without a fixed schema              | Active. The default document store; its SSPL license (since 2018) is not OSI open source.                                                   |
| MySQL      | Open-source relational database, long the standard in the LAMP stack and owned by Oracle     | Active and widely deployed, but PostgreSQL has become the more common default for new projects.                                             |
| PostgreSQL | Open-source relational database with strong SQL compliance, JSONB and an extension ecosystem | Active. The usual default for new general-purpose applications.                                                                             |
| SQLite     | Embedded, serverless relational database that lives in a single file                         | Active. The default for local and embedded storage (apps, browsers, phones); one writer at a time rules it out for busy multi-user servers. |
