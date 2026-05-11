'use client';

import { useState, useEffect, useCallback } from 'react';

export const GOOGLE_TOKEN_STORAGE_KEY = 'google_provider_token';

export function useGoogleToken() {
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    setGoogleToken(localStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY));
  }, []);

  const clearGoogleToken = useCallback(() => {
    localStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
    setGoogleToken(null);
  }, []);

  return { googleToken, clearGoogleToken };
}
