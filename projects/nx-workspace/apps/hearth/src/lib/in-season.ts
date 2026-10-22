import produce from './generated/in-season-produce.json';

export const HEMISPHERE = {
  NORTHERN: 'northern',
  SOUTHERN: 'southern',
} as const;

export type Hemisphere = (typeof HEMISPHERE)[keyof typeof HEMISPHERE];

export type SeasonalItem = { name: string; months: number[] };

export const SEASONAL_PRODUCE: Record<
  'fruits' | 'vegetables',
  SeasonalItem[]
> = produce;

const MONTHS_IN_YEAR = 12;
const SOUTHERN_SEASON_SHIFT_MONTHS = 6;

const SOUTHERN_TIME_ZONE_PREFIXES = [
  'Antarctica/',
  'Australia/',
  'America/Argentina/',
];

// Zones wholly or mostly south of the equator; equatorial zones that straddle
// it (e.g. America/Bogota, Asia/Singapore) are left to the Northern default.
const SOUTHERN_TIME_ZONES = new Set([
  'Africa/Blantyre',
  'Africa/Gaborone',
  'Africa/Harare',
  'Africa/Johannesburg',
  'Africa/Lubumbashi',
  'Africa/Luanda',
  'Africa/Lusaka',
  'Africa/Maputo',
  'Africa/Maseru',
  'Africa/Mbabane',
  'Africa/Windhoek',
  'America/Asuncion',
  'America/Bahia',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/La_Paz',
  'America/Lima',
  'America/Montevideo',
  'America/Punta_Arenas',
  'America/Recife',
  'America/Santiago',
  'America/Sao_Paulo',
  'Asia/Dili',
  'Asia/Jakarta',
  'Asia/Makassar',
  'Indian/Antananarivo',
  'Indian/Mauritius',
  'Indian/Reunion',
  'Pacific/Apia',
  'Pacific/Auckland',
  'Pacific/Chatham',
  'Pacific/Fiji',
  'Pacific/Noumea',
  'Pacific/Port_Moresby',
  'Pacific/Tahiti',
  'Pacific/Tongatapu',
]);

export const hemisphereFromLatitude = (latitude: number): Hemisphere =>
  latitude < 0 ? HEMISPHERE.SOUTHERN : HEMISPHERE.NORTHERN;

export const hemisphereFromTimeZone = (
  timeZone: string | null | undefined,
): Hemisphere =>
  timeZone &&
  (SOUTHERN_TIME_ZONES.has(timeZone) ||
    SOUTHERN_TIME_ZONE_PREFIXES.some(prefix => timeZone.startsWith(prefix)))
    ? HEMISPHERE.SOUTHERN
    : HEMISPHERE.NORTHERN;

// Latitude wins when known; the time zone covers denied, unsupported or
// still-pending geolocation. Only latitude matters, never longitude.
export const detectHemisphere = ({
  latitude,
  timeZone,
}: {
  latitude: number | null;
  timeZone: string | null | undefined;
}): Hemisphere =>
  latitude === null
    ? hemisphereFromTimeZone(timeZone)
    : hemisphereFromLatitude(latitude);

// `month` is 1-12. The notes describe a Northern climate, so the Southern
// Hemisphere looks up the month six months away.
export const getInSeason = (
  items: SeasonalItem[],
  hemisphere: Hemisphere,
  month: number,
): string[] => {
  const noteMonth =
    hemisphere === HEMISPHERE.SOUTHERN
      ? ((month - 1 + SOUTHERN_SEASON_SHIFT_MONTHS) % MONTHS_IN_YEAR) + 1
      : month;
  return items.filter(i => i.months.includes(noteMonth)).map(i => i.name);
};
