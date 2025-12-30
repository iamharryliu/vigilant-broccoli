import { CalendarConfig } from './google-calendar.models';

/**
 * Encodes a calendar source to base64 without padding (browser-compatible)
 * @param src - The calendar source string to encode
 * @returns Base64 encoded string without padding
 */
export function encodeCalendarSrc(src: string): string {
  // Use btoa for browser-compatible base64 encoding
  // btoa expects binary string, so we need to handle UTF-8 properly
  const utf8Bytes = new TextEncoder().encode(src);
  const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binaryString).replace(/=+$/, '');
}

/**
 * Builds a Google Calendar embed URL from configuration
 * @param config - Calendar configuration object
 * @returns Google Calendar embed URL
 */
export function buildCalendarUrl(config: CalendarConfig): string {
  // Base URL params
  const baseParams = [
    `height=${config.height}`,
    `wkst=${config.wkst}`,
    `ctz=${encodeURIComponent(config.ctz)}`,
    `showPrint=${config.showPrint}`,
    `mode=${config.mode}`,
  ];

  if (config.title !== undefined) {
    baseParams.push(`title=${encodeURIComponent(config.title)}`);
    baseParams.push(''); // Add extra empty param to create && in URL (matches Google's format)
  }

  // Owner calendar sources (base64 encoded without padding)
  const ownerSrcParams = config.ownerCalendars.map(cal =>
    `src=${encodeCalendarSrc(cal.email)}`
  );

  // Shared calendar sources (base64 encoded without padding)
  const sharedSrcParams = config.sharedCalendars.map(cal =>
    `src=${encodeCalendarSrc(cal.id)}`
  );

  // All color parameters (owner + shared, in order)
  const colorParams = [
    ...config.ownerCalendars.map(cal => cal.color),
    ...config.sharedCalendars.map(cal => cal.color),
  ]
    .filter((color): color is string => color !== undefined)
    .map(color => `color=${color}`);

  const allParams = [...baseParams, ...ownerSrcParams, ...colorParams, ...sharedSrcParams]

  return `https://calendar.google.com/calendar/embed?${allParams.join('&')}`;
}
