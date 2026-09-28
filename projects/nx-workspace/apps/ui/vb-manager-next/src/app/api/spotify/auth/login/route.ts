import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { getUserEmail } from '../../../../../../libs/server-auth';
import { createSpotifyOAuthState } from '../../../../../../libs/spotify-oauth-state';
import { spotifyRedirectUri } from '../../../../../../libs/spotify-token';

export const runtime = 'nodejs';

const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_AUTH_SCOPE = 'playlist-read-private playlist-read-collaborative';
const RESPONSE_TYPE_CODE = 'code';

export async function GET(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const authorizeUrl = new URL(SPOTIFY_AUTHORIZE_URL);
  authorizeUrl.searchParams.set(
    'client_id',
    getEnvironmentVariable('SPOTIFY_CLIENT_ID'),
  );
  authorizeUrl.searchParams.set('response_type', RESPONSE_TYPE_CODE);
  authorizeUrl.searchParams.set(
    'redirect_uri',
    spotifyRedirectUri(request.nextUrl.origin),
  );
  authorizeUrl.searchParams.set('scope', SPOTIFY_AUTH_SCOPE);
  authorizeUrl.searchParams.set('state', createSpotifyOAuthState(userEmail));

  return NextResponse.json({ authorizeUrl: authorizeUrl.toString() });
}
