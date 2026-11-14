export interface ProviderRefreshToken {
  refreshToken: string;
  accessToken: string | null;
}

export interface CreateSupabaseAuthOptions {
  // A getter defers the read to the first client use, for config loaded at
  // runtime rather than inlined at build time.
  supabaseUrl: string | (() => string);
  supabaseKey: string | (() => string);
  googleScopes?: string;
  // Request Google offline access so sign-in also returns a long-lived
  // provider_refresh_token, enabling server-side access-token refresh.
  offlineAccess?: boolean;
  // Extra Google authorization params, e.g. `include_granted_scopes` so a
  // narrower app's consent keeps the scopes other apps on the shared stored
  // refresh token rely on.
  googleQueryParams?: Record<string, string>;
  // localStorage key (and cross-tab channel) for the session; omit for
  // supabase-js's default. Changing it on a live app signs everyone out.
  storageKey?: string;
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
  json?: boolean;
}
