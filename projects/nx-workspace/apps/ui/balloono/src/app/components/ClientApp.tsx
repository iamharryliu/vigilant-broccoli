'use client';

import dynamic from 'next/dynamic';

// Client-only: the game reads localStorage, the system theme and a canvas on
// first render, none of which exist during server rendering.
export const ClientApp = dynamic(() => import('./BalloonoApp'), {
  ssr: false,
});
