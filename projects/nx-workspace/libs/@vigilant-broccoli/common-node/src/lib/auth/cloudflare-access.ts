import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getEnvironmentVariable } from '../utils';

const ACCESS_ASSERTION_HEADER = 'Cf-Access-Jwt-Assertion';
const verificationKeys = new Map<
  string,
  ReturnType<typeof createRemoteJWKSet>
>();

export async function isStagingUiRequestAuthorized(
  request: Request,
): Promise<boolean> {
  // Next.js inlines this flag so missing runtime configuration cannot open staging.
  if (process.env.STAGING_UI_ACCESS_REQUIRED !== 'true') {
    return true;
  }

  const issuer = getEnvironmentVariable('STAGING_UI_ACCESS_ISSUER');
  const audience = getEnvironmentVariable('STAGING_UI_ACCESS_AUDIENCE');
  const assertion = request.headers.get(ACCESS_ASSERTION_HEADER);
  if (!issuer || !audience || !assertion) {
    return false;
  }

  try {
    let keys = verificationKeys.get(issuer);
    if (!keys) {
      keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
      verificationKeys.set(issuer, keys);
    }
    await jwtVerify(assertion, keys, {
      issuer,
      audience,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'aud', 'iss'],
    });
    return true;
  } catch {
    return false;
  }
}
