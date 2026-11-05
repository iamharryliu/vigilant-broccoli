# Text Tools

## Conversions

- Every tool is a `ConversionForm` (input textarea, live result in `CopyPastable`) defined in `src/app/TextToolsPage.tsx`; `EnvUtils` from `common-js` does the conversion. Nothing leaves the browser.
- Dropping a `.txt`, `.json`, `.csv`, `.pem` or `.env` file on an input loads it as text.
- Text Analysis counts characters, words (`countWords`) and sentences.

## Embedding

- `public/_headers` sets `Content-Security-Policy: frame-ancestors 'self' https://manager.vigilant-broccoli.app`, so only the manager's Dev Dashboard Text Tools tab can iframe the site. There is no staging manager host.
- Staging (`staging-text-tools-ui.pages.dev`) is behind Cloudflare Access and carries the same header.
