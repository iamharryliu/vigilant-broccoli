import { PHASE_PRODUCTION_BUILD } from 'next/constants';

// Starts the connection collector at server boot so the map records traffic
// while no page is open, not just while one polls.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return;
  const { startConnectionCollector } =
    await import('./app/api/network-monitor/_lib/connection-collector');
  startConnectionCollector();
}
