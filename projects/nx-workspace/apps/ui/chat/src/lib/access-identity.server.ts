import { createRemoteJWKSet, JWTVerifyGetKey, jwtVerify } from 'jose';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const ACCESS_JWT_HEADER = 'cf-access-jwt-assertion';
const ACCESS_CERTS_PATH = '/cdn-cgi/access/certs';
const DEVELOPMENT = 'development';

const jwksByIssuer = new Map<string, JWTVerifyGetKey>();

// Created on first use so module init needs no env or network.
const getJwks = (issuer: string) => {
  const existing = jwksByIssuer.get(issuer);
  if (existing) return existing;
  const jwks = createRemoteJWKSet(new URL(`${issuer}${ACCESS_CERTS_PATH}`));
  jwksByIssuer.set(issuer, jwks);
  return jwks;
};

// Cloudflare Access gates the custom hosts at the edge, but the Vercel
// project's own *.vercel.app aliases bypass Cloudflare, so the signed
// assertion is the only identity this app trusts. Any failure (missing token,
// expired, wrong issuer or audience, no config) returns null.
export async function getAccessEmail(headers: Headers): Promise<string | null> {
  if (process.env.NODE_ENV === DEVELOPMENT && process.env.CHAT_DEV_SENDER) {
    return process.env.CHAT_DEV_SENDER;
  }
  const teamDomain = getEnvironmentVariable('CF_ACCESS_TEAM_DOMAIN');
  const audience = getEnvironmentVariable('CF_ACCESS_AUD');
  const token = headers.get(ACCESS_JWT_HEADER);
  if (!teamDomain || !audience || !token) return null;
  const issuer = `https://${teamDomain}`;
  try {
    const { payload } = await jwtVerify(token, getJwks(issuer), {
      issuer,
      audience,
    });
    return typeof payload.email === 'string' && payload.email
      ? payload.email
      : null;
  } catch {
    return null;
  }
}
