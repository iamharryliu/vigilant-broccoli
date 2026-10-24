import { WebClient } from '@slack/web-api';
import { isDemoUserId } from '../consts/demo-users.const';
import { formatISODateInTimeZone } from './date.utils';

const TIME_ZONE_CACHE_MS = 60 * 60 * 1000;
// Web API clients retry for minutes and a modal's trigger_id expires after 3 seconds.
const USERS_INFO_TIMEOUT_MS = 1500;

export type GetUserTodayISO = (
  client: WebClient,
  userId: string,
) => Promise<string>;

// The server runs in UTC, so "today" must come from each member's Slack timezone.
// Seeded members, the mock client (no `tz`) and failed lookups use `fallbackTimeZone`.
export function createUserTodayResolver(
  fallbackTimeZone: string,
): GetUserTodayISO {
  const cache = new Map<string, { timeZone: string; expiresAt: number }>();

  const lookUpTimeZone = async (client: WebClient, userId: string) => {
    try {
      const { user } = await Promise.race([
        client.users.info({ user: userId }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('users.info timed out')),
            USERS_INFO_TIMEOUT_MS,
          ).unref(),
        ),
      ]);
      return user?.tz ?? fallbackTimeZone;
    } catch (error) {
      console.error(`[slack] could not resolve timezone for ${userId}`, error);
      return fallbackTimeZone;
    }
  };

  const resolveTimeZone = async (client: WebClient, userId: string) => {
    if (isDemoUserId(userId)) return fallbackTimeZone;
    const cached = cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return cached.timeZone;
    const timeZone = await lookUpTimeZone(client, userId);
    cache.set(userId, { timeZone, expiresAt: Date.now() + TIME_ZONE_CACHE_MS });
    return timeZone;
  };

  return async (client, userId) =>
    formatISODateInTimeZone(new Date(), await resolveTimeZone(client, userId));
}
