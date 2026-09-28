import { NextRequest, NextResponse } from 'next/server';
import { verifySpotifyOAuthState } from '../../../../../../libs/spotify-oauth-state';
import {
  exchangeSpotifyAuthorizationCode,
  spotifyAppOrigin,
  spotifyRedirectUri,
  storeSpotifyRefreshToken,
} from '../../../../../../libs/spotify-token';
import { SIDEBAR_ROUTE } from '../../../../app.const';
import {
  SPOTIFY_ERROR_QUERY_PARAM,
  SPOTIFY_OAUTH_ERROR,
} from '../../../../constants/spotify.consts';

export const runtime = 'nodejs';

const redirectWithError = (request: NextRequest, error: string) => {
  const url = new URL(
    SIDEBAR_ROUTE.SPOTIFY_PLAYLISTS.path,
    spotifyAppOrigin(request.nextUrl.origin),
  );
  url.searchParams.set(SPOTIFY_ERROR_QUERY_PARAM, error);
  return NextResponse.redirect(url);
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  if (!code || !state) {
    return redirectWithError(request, SPOTIFY_OAUTH_ERROR.MISSING_CODE);
  }

  const userEmail = verifySpotifyOAuthState(state);
  if (!userEmail) {
    return redirectWithError(request, SPOTIFY_OAUTH_ERROR.INVALID_STATE);
  }

  try {
    const { refreshToken } = await exchangeSpotifyAuthorizationCode(
      code,
      spotifyRedirectUri(request.nextUrl.origin),
    );
    await storeSpotifyRefreshToken(userEmail, refreshToken);
  } catch {
    return redirectWithError(
      request,
      SPOTIFY_OAUTH_ERROR.TOKEN_EXCHANGE_FAILED,
    );
  }

  return NextResponse.redirect(
    new URL(
      SIDEBAR_ROUTE.SPOTIFY_PLAYLISTS.path,
      spotifyAppOrigin(request.nextUrl.origin),
    ),
  );
}
