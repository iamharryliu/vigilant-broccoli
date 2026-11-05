# Software Products

## Table of Contents

- [Data Processing](#data-processing)
- [Databases](#databases)
- [Infrastructure](#infrastructure)
- [Messaging](#messaging)

## Data Processing

| Product | What it is | Status |
| :-- | :-- | :-- |
| Hadoop | Open-source framework for distributed storage (HDFS), batch processing (MapReduce) and cluster scheduling (YARN) | Largely legacy for new projects. MapReduce writes to disk between steps, so it is slow, and HDFS ties storage to compute and needs cluster operations that managed cloud services remove. Replaced by Spark for processing, S3 or GCS for storage, and BigQuery, Snowflake or Databricks. |

## Databases

| Product | What it is | Status |
| :-- | :-- | :-- |
| ClickHouse | Open-source column-oriented OLAP database for fast analytical queries over large datasets | Active and growing. A common choice for real-time analytics, logs and observability; poor fit for transactional workloads with frequent updates. |
| Elasticsearch | Distributed search and analytics engine built on Lucene, storing JSON documents with full-text indexes | Active. The standard for full-text search and log analytics (ELK stack). Its 2021 license change led AWS to fork OpenSearch; an AGPL option was added in 2024. |
| MariaDB | Community fork of MySQL created by its original developers after Oracle acquired MySQL | Active. Largely MySQL-compatible, but the two are diverging, so it is no longer a guaranteed drop-in replacement. |
| MongoDB | Document database that stores JSON-like (BSON) documents without a fixed schema | Active. The default document store; its SSPL license (since 2018) is not OSI open source. |
| MySQL | Open-source relational database, long the standard in the LAMP stack and owned by Oracle | Active and widely deployed, but PostgreSQL has become the more common default for new projects. |
| PostgreSQL | Open-source relational database with strong SQL compliance, JSONB and an extension ecosystem | Active. The usual default for new general-purpose applications. |
| SQLite | Embedded, serverless relational database that lives in a single file | Active. The default for local and embedded storage (apps, browsers, phones); one writer at a time rules it out for busy multi-user servers. |

## Infrastructure

| Product | What it is | Status |
| :-- | :-- | :-- |
| Kubernetes | Open-source container orchestrator that schedules, scales and heals containers across a cluster from declarative config | Active. The industry standard for container orchestration, usually run managed (GKE, EKS, AKS). Often overkill for small teams, where a PaaS or plain containers are simpler. |
| Terraform | Infrastructure-as-code tool that provisions cloud resources from declarative HCL config and tracks them in a state file | Active and the most widely used IaC tool. HashiCorp moved it to the source-available BSL in 2023, prompting the open-source OpenTofu fork; IBM acquired HashiCorp in 2025. |

## Messaging

| Product | What it is | Status |
| :-- | :-- | :-- |
| Kafka | Distributed, append-only event log for publishing, storing and streaming high volumes of events between services | Active. The default for event streaming and data pipelines; KRaft replaced ZooKeeper in 4.0. Heavy to operate for simple job queues, where RabbitMQ or SQS fit better. |
| RabbitMQ | Open-source message broker implementing AMQP that routes messages from producers to queues through exchanges | Active. A common default for task queues and service-to-service messaging; messages are removed once acknowledged, so it is not built for replay or high-volume event streaming like Kafka. |
