# iframe

## Table of Contents

- [What It Is](#what-it-is)
- [Common Attributes](#common-attributes)
- [Security](#security)
- [Communication Between Pages](#communication-between-pages)
- [Embedding Restrictions](#embedding-restrictions)
- [Pros and Cons](#pros-and-cons)

## What It Is

`<iframe>` embeds another HTML document inside the current page as a nested browsing context. The embedded page has its own DOM, JavaScript scope, and CSS, so styles and scripts on either side do not leak into the other.

```html
<iframe
  src="https://example.com/embed"
  title="Example embed"
  width="600"
  height="400"
  loading="lazy"
></iframe>
```

## Common Attributes

| Attribute | Purpose |
| --- | --- |
| `allow` | Permissions policy for features such as `fullscreen`, `camera`, or `clipboard-write`. |
| `allowfullscreen` | Lets the embedded page request fullscreen. |
| `loading` | `lazy` defers loading until the frame nears the viewport. |
| `referrerpolicy` | Controls the `Referer` header sent when loading the frame. |
| `sandbox` | Restricts what the embedded page can do (see [Security](#security)). |
| `src` | URL of the page to embed. |
| `srcdoc` | Inline HTML to render instead of loading a URL. |
| `title` | Accessible name describing the frame's content; required for screen readers. |

## Security

- `sandbox` with no value applies every restriction (no scripts, forms, popups, or same-origin access). Re-enable only what is needed with tokens such as `allow-scripts` or `allow-forms`.
- Combining `allow-scripts` and `allow-same-origin` on a same-origin page lets the frame remove its own sandbox, so avoid that pairing for untrusted content.
- Clickjacking: a malicious site can frame your page invisibly and trick users into clicking. Prevent it with the `frame-ancestors` CSP directive or the legacy `X-Frame-Options` header.
- Treat embedded third-party content as untrusted; it can track users and load its own resources.

## Communication Between Pages

- Same-origin frames can access each other directly through `iframe.contentWindow` and `window.parent`.
- Cross-origin frames can only exchange messages with `postMessage`; always check `event.origin` before trusting a message.

```js
frame.contentWindow.postMessage({ type: 'ping' }, 'https://example.com');

window.addEventListener('message', event => {
  if (event.origin !== 'https://example.com') return;
  console.log(event.data);
});
```

## Embedding Restrictions

A site opts out of being framed with `X-Frame-Options: DENY | SAMEORIGIN` or `Content-Security-Policy: frame-ancestors 'none' | 'self' <origins>`. A blocked frame renders as an empty or error page, which is why many sites (login pages, dashboards) cannot be embedded.

## Pros and Cons

| Pros | Cons |
| --- | --- |
| Strong isolation of styles, scripts, and crashes. | Each frame loads a full document, which costs memory and network. |
| Easy way to embed third-party widgets (maps, videos, payments). | Sizing to content is awkward; it needs `postMessage` or fixed dimensions. |
| Sandboxing limits what untrusted content can do. | Poor for SEO and accessibility unless titled; deep links and history can be confusing. |
