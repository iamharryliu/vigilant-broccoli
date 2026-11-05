# Self-Hosting

Run the email-service queue producer and consumer from the `iamharryliu/email-service` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Nuances](#nuances)

## Run from Registry

The image is `linux/amd64`, listens on port 3000 and runs as a non-root user. It needs a RabbitMQ broker and a Resend account.

```
docker run --platform linux/amd64 \
  -p 3000:3000 \
  -e SHARED_APP_TOKEN=<token> \
  -e RABBITMQ_CONNECTION_STRING=amqps://<user>:<password>@<host>:5671 \
  -e RESEND_API_KEY=<key> \
  iamharryliu/email-service:latest
```

`POST /api/send-email` (one email) and `POST /api/queue-emails` (an array) publish to the durable `EMAIL` queue; the same process consumes the queue and sends through Resend. Call them with `x-api-key: <token>`. `GET /` and the API reference at `/docs` need no key.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `HOST`, `PORT` | No | Listen address; the image sets `0.0.0.0` and `3000`. |
| `RABBITMQ_CA_CERT` | No | Base64-encoded CA certificate that verifies a broker using a private CA. |
| `RABBITMQ_CONNECTION_STRING` | Yes | AMQP URL of the broker. |
| `RESEND_API_KEY` | Yes | Resend API key used to send each queued email. |
| `SHARED_APP_TOKEN` | Yes | API key every `/api/*` request must send in the `x-api-key` header. |

## Nuances

- With `SHARED_APP_TOKEN` unset, every `/api/*` request returns 500 `Unauthorized`.
- The consumer starts only when `RABBITMQ_CONNECTION_STRING` is set, but the producer routes need it too: without it, queueing fails with 500.
- With `RABBITMQ_CA_CERT` set, the broker certificate is verified against the hostname `rabbitmq`, not the host in the connection string, so issue the certificate for that name.
- A failed send is requeued up to five deliveries, then moved to the `EMAIL_DLQ` queue; nothing reads that queue.
- An email without `from` is sent from `test@harryliu.dev`, so set `from` to an address on a domain verified in Resend.
