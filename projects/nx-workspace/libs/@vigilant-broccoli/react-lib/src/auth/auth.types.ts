export interface ProviderRefreshToken {
  refreshToken: string;
  accessToken: string | null;
}

export interface CreateSupabaseAuthOptions {
  supabaseUrl: string;
  supabaseKey: string;
  googleScopes?: string;
  // Request Google offline access so sign-in also returns a long-lived
  // provider_refresh_token, enabling server-side access-token refresh.
  offlineAccess?: boolean;
  // Invoked whenever a session carries a provider_refresh_token (only emitted
  // by Google at consent time) so the app can persist it server-side.
  onProviderRefreshToken?: (
    token: ProviderRefreshToken,
  ) => void | Promise<void>;
  routes: {
    home: string;
    login: string;
    callback: string;
  };
}

export interface BuildAuthHeadersOptions {
  includeGoogleToken?: boolean;
  json?: boolean;
}
