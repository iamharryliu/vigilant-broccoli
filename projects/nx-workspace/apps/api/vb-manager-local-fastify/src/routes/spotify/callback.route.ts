import { verifySpotifyOAuthState } from '../../libs/spotify-oauth-state';
import {
  exchangeSpotifyAuthorizationCode,
  spotifyAppOrigin,
  spotifyRedirectUri,
  storeSpotifyRefreshToken,
} from '../../libs/spotify-token';
import {
  SPOTIFY_ERROR_QUERY_PARAM,
  SPOTIFY_MUSIC_PATH,
  SPOTIFY_OAUTH_ERROR,
} from '@vigilant-broccoli/vb-manager-local-common';

const redirectWithError = (request: Request, error: string) => {
  const url = new URL(
    SPOTIFY_MUSIC_PATH,
    spotifyAppOrigin(new URL(request.url).origin),
  );
  url.searchParams.set(SPOTIFY_ERROR_QUERY_PARAM, error);
  return Response.redirect(url);
};

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code');
  const state = new URL(request.url).searchParams.get('state');
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
      spotifyRedirectUri(new URL(request.url).origin),
    );
    await storeSpotifyRefreshToken(userEmail, refreshToken);
  } catch {
    return redirectWithError(
      request,
      SPOTIFY_OAUTH_ERROR.TOKEN_EXCHANGE_FAILED,
    );
  }

  return Response.redirect(
    new URL(SPOTIFY_MUSIC_PATH, spotifyAppOrigin(new URL(request.url).origin)),
  );
}
