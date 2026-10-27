# Self-Hosting

Run the llm-service multi-provider LLM proxy from the `iamharryliu/llm-service` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Nuances](#nuances)

## Run from Registry

The image is `linux/amd64`, listens on port 3000 and runs as a non-root user. Set the key of each provider whose models you call.

```
docker run --platform linux/amd64 \
  -p 3000:3000 \
  -e SHARED_APP_TOKEN=<token> \
  -e OPENAI_API_KEY=<key> \
  iamharryliu/llm-service:latest
```

Call `POST /api/llm` (a prompt with a `model`, optional images, JSON schema or several outputs) or `POST /api/chat` (streamed chat) with `x-api-key: <token>`. `GET /` and the API reference at `/docs` need no key.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | No | Anthropic key for Claude models. |
| `DEEPSEEK_API_KEY` | No | DeepSeek key for DeepSeek models. |
| `GEMINI_API_KEY` | No | Google Gemini key for Gemini models. |
| `GROK_API_KEY` | No | xAI key for Grok models. |
| `HOST`, `PORT` | No | Listen address; the image sets `0.0.0.0` and `3000`. |
| `OPENAI_API_KEY` | No | OpenAI key for GPT models; also used for any model that no other provider claims, and by `/api/chat`'s default model. |
| `SHARED_APP_TOKEN` | Yes | API key every `/api/*` request must send in the `x-api-key` header. |

## Nuances

- With `SHARED_APP_TOKEN` unset, every `/api/*` request returns 500 `Unauthorized`.
- The provider is chosen from the requested `model`. A model whose provider key is unset fails when called, not at startup.
- `/api/chat` falls back to the default OpenAI model when `model` is missing or unknown, so it needs `OPENAI_API_KEY` unless every request names a supported model.
- CORS has no allowed origins, so browsers on any origin are blocked; server-to-server calls are unaffected.
- Request bodies are capped at 10 MB.
