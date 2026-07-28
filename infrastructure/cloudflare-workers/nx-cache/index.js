// Implements the Nx self-hosted remote cache HTTP contract
// (NX_SELF_HOSTED_REMOTE_CACHE_SERVER / NX_SELF_HOSTED_REMOTE_CACHE_ACCESS_TOKEN)
// in front of the "nx-cache" R2 bucket. This is the enforcement layer that
// direct S3-credential access (the deprecated @nx/s3-cache plugin, CVE-2025-36852
// "CREEP") never had: no R2 credential is ever handed out, only two opaque
// bearer tokens scoped to this Worker, and writes to an existing key are
// rejected instead of silently overwritten.

const CACHE_KEY_PREFIX = 'v1/cache/';
const CACHE_PATH_PATTERN = /^\/v1\/cache\/([a-zA-Z0-9]+)$/;

function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function bearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response('ok', { status: 200 });
    }

    const match = url.pathname.match(CACHE_PATH_PATTERN);
    if (!match) {
      return new Response('Not Found', { status: 404 });
    }
    const key = CACHE_KEY_PREFIX + match[1];

    const token = bearerToken(request);
    const isWriteToken =
      token !== null && timingSafeEqual(token, env.WRITE_TOKEN);
    const isReadToken =
      token !== null && timingSafeEqual(token, env.READ_TOKEN);
    if (!isWriteToken && !isReadToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (request.method === 'GET') {
      const object = await env.CACHE.get(key);
      if (!object) {
        return new Response(null, { status: 404 });
      }
      return new Response(object.body, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(object.size),
        },
      });
    }

    if (request.method === 'HEAD') {
      const object = await env.CACHE.head(key);
      return new Response(null, { status: object ? 200 : 404 });
    }

    if (request.method === 'PUT') {
      if (!isWriteToken) {
        return new Response('Forbidden', { status: 403 });
      }
      // Immutable writes: first successful writer for a given content-hash
      // key wins. This is the actual CREEP fix — a cache key can be created,
      // never overwritten, so a leaked read-only token (or a compromised PR
      // build) can't poison an entry another build already trusts.
      const existing = await env.CACHE.head(key);
      if (existing) {
        return new Response(null, { status: 409 });
      }
      await env.CACHE.put(key, request.body);
      return new Response(null, { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
  },
};
