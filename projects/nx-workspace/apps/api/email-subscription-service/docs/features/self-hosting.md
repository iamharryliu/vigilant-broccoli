# Self-Hosting

Run the email-subscription-service subscription manager from the `iamharryliu/email-subscription-service` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Dependencies](#dependencies)
- [Supabase Table](#supabase-table)
- [Nuances](#nuances)

## Run from Registry

The image is `linux/amd64`, listens on port 3000 and runs as a non-root user.

```
docker run --platform linux/amd64 \
  -p 3000:3000 \
  -e SHARED_APP_TOKEN=<token> \
  -e RABBITMQ_CONNECTION_STRING=amqps://<user>:<password>@<host>:5671 \
  -e EMAIL_SERVICE_URL=https://<email-service host> \
  -e SUPABASE_SECRET_KEY=<secret key> \
  -e SUPABASE_URL=https://<project ref>.supabase.co \
  -e EMAIL_FROM_ADDRESS=<sender address> \
  iamharryliu/email-subscription-service:latest
```

Routes, all `POST` under `/api` and sent with `x-api-key: <token>`: `/subscribe` and `/unsubscribe` take `email` and `subscriptionName`; `/notify` takes `subscriptionName` and `message` and queues one email per subscriber. `GET /` and the API reference at `/docs` need no key.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `EMAIL_FROM_ADDRESS` | Yes | Sender address of confirmation and notification emails; your email-service provider must be allowed to send from it. The service exits at startup when it is unset. |
| `EMAIL_FROM_NAME` | No | Display name shown on the sender; without it the bare address is used. |
| `EMAIL_SERVICE_URL` | Yes | Base URL of an email-service instance that sends the queued emails. |
| `HOST`, `PORT` | No | Listen address; the image sets `0.0.0.0` and `3000`. |
| `RABBITMQ_CA_CERT` | No | Base64-encoded CA certificate that verifies a broker using a private CA. |
| `RABBITMQ_CONNECTION_STRING` | Yes | AMQP URL of the broker. |
| `SHARED_APP_TOKEN` | Yes | API key every `/api/*` request must send; also sent to email-service as its `x-api-key`. |
| `SUPABASE_SECRET_KEY` | Yes | Secret key for the Supabase project holding the subscriptions table. |
| `SUPABASE_URL` | Yes | URL of that Supabase project. The service exits at startup when it is unset. |

## Dependencies

| Dependency | Used for |
| --- | --- |
| email-service | The consumer posts each queued email to `EMAIL_SERVICE_URL`, with the same `SHARED_APP_TOKEN`. |
| RabbitMQ | Durable `EMAIL_SUBSCRIPTION` queue, with an `EMAIL_SUBSCRIPTION_DLQ` dead-letter queue. |
| Supabase | `email_subscriptions` table. |

## Supabase Table

Apply `migrations/*.sql` from the app directory to the database first; the service does not create the table. `email_subscriptions` has `id`, `email`, `subscription_name` and `created_at`, unique on `(email, subscription_name)`. Row-level security is enabled with no policies, so only the secret key can read or write it.

## Nuances

- With `SHARED_APP_TOKEN` unset, every `/api/*` request returns 500 `Unauthorized`.
- The queue consumer starts only when `RABBITMQ_CONNECTION_STRING` is set; `/subscribe` still succeeds without it but the confirmation email is not queued, and `/notify` reports fewer queued emails.
- With `RABBITMQ_CA_CERT` set, the broker certificate is verified against the hostname `rabbitmq`, not the host in the connection string.
- A failed send is requeued up to five deliveries, then moved to the dead-letter queue; nothing reads that queue.
