// Serves the pages-index build from projects.harryliu.dev under the status
// hostname. GitHub Pages allows one custom domain per site, so a second
// hostname cannot be attached to it; this Worker is a pass-through instead.
// The app itself picks StatusPage when it sees the status hostname — a URL
// fragment never reaches the network, so no rewrite here could select the
// route.

const ALLOWED_METHODS = ['GET', 'HEAD'];
const FORWARDED_REQUEST_HEADERS = [
  'accept',
  'accept-language',
  'if-modified-since',
  'if-none-match',
  'range',
];
const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

function rewriteLocation(location, upstreamOrigin, requestUrl) {
  const target = new URL(location, upstreamOrigin);
  if (target.origin !== upstreamOrigin) {
    return location;
  }
  return new URL(
    `${target.pathname}${target.search}${target.hash}`,
    requestUrl.origin,
  ).toString();
}

export default {
  async fetch(request, env) {
    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: ALLOWED_METHODS.join(', ') },
      });
    }

    const requestUrl = new URL(request.url);
    const upstreamOrigin = new URL(env.UPSTREAM_ORIGIN).origin;
    const upstreamUrl = new URL(
      `${requestUrl.pathname}${requestUrl.search}`,
      upstreamOrigin,
    );

    const upstreamHeaders = new Headers();
    FORWARDED_REQUEST_HEADERS.forEach(name => {
      const value = request.headers.get(name);
      if (value !== null) {
        upstreamHeaders.set(name, value);
      }
    });

    // Redirects stay manual so a Location pointing at the upstream host can be
    // rewritten; following them here would hide the redirect from the browser.
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: upstreamHeaders,
      redirect: 'manual',
    });

    const headers = new Headers(upstream.headers);
    const location = upstream.headers.get('location');
    if (REDIRECT_STATUSES.includes(upstream.status) && location) {
      headers.set(
        'location',
        rewriteLocation(location, upstreamOrigin, requestUrl),
      );
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  },
};
