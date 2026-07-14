export interface CreateSupabaseAuthOptions {
  supabaseUrl: string;
  supabaseKey: string;
  googleScopes?: string;
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
