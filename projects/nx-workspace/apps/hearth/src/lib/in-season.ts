import produce from './generated/in-season-produce.json';

export const HEMISPHERE = {
  NORTHERN: 'northern',
  SOUTHERN: 'southern',
} as const;

export type Hemisphere = (typeof HEMISPHERE)[keyof typeof HEMISPHERE];

export type SeasonalItem = { name: string; months: number[] };

export const SEASONAL_PRODUCE: Record<'fruits' | 'vegetables', SeasonalItem[]> =
  produce;

// Only items with a matching Unicode emoji; the rest render as plain badges.
const PRODUCE_EMOJI: Record<string, string> = {
  Apple: '🍎',
  Avocado: '🥑',
  Blueberry: '🫐',
  Broccoli: '🥦',
  'Bell Pepper': '🫑',
  Cantaloupe: '🍈',
  Carrot: '🥕',
  Cherry: '🍒',
  Corn: '🌽',
  Cucumber: '🥒',
  Eggplant: '🍆',
  Garlic: '🧄',
  Grape: '🍇',
  'Green Bean': '🫘',
  'Honeydew Melon': '🍈',
  Kale: '🥬',
  Kiwi: '🥝',
  Lemon: '🍋',
  Lettuce: '🥬',
  Lime: '🍋‍🟩',
  Mango: '🥭',
  Mushroom: '🍄',
  Onion: '🧅',
  Orange: '🍊',
  Pea: '🫛',
  Peach: '🍑',
  Pear: '🍐',
  Pineapple: '🍍',
  Potato: '🥔',
  Pumpkin: '🎃',
  Strawberry: '🍓',
  'Sweet Potato': '🍠',
  'Tangerine / Mandarin': '🍊',
  Tomato: '🍅',
  Watermelon: '🍉',
};

export const getProduceEmoji = (name: string): string | undefined =>
  PRODUCE_EMOJI[name];

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

export const SEASON_STATUS = {
  JUST_IN: 'just-in',
  LAST_CHANCE: 'last-chance',
  REGULAR: 'regular',
} as const;

export type SeasonStatus = (typeof SEASON_STATUS)[keyof typeof SEASON_STATUS];

export const SEASON_STATUS_EMOJI = {
  [SEASON_STATUS.JUST_IN]: '🌱',
  [SEASON_STATUS.LAST_CHANCE]: '⏳',
} as const;

export const SEASON_STATUS_LABEL_KEY = {
  [SEASON_STATUS.JUST_IN]: 'IN_SEASON.JUST_IN',
  [SEASON_STATUS.LAST_CHANCE]: 'IN_SEASON.LAST_CHANCE',
} as const;

// The notes describe a Northern climate, so the Southern Hemisphere looks up
// the month six months away.
const toNoteMonth = (hemisphere: Hemisphere, month: number): number =>
  hemisphere === HEMISPHERE.SOUTHERN
    ? ((month - 1 + SOUTHERN_SEASON_SHIFT_MONTHS) % MONTHS_IN_YEAR) + 1
    : month;

// `month` is 1-12.
export const getInSeasonItems = (
  items: SeasonalItem[],
  hemisphere: Hemisphere,
  month: number,
): SeasonalItem[] => {
  const noteMonth = toNoteMonth(hemisphere, month);
  return items.filter(i => i.months.includes(noteMonth));
};

export const getInSeason = (
  items: SeasonalItem[],
  hemisphere: Hemisphere,
  month: number,
): string[] => getInSeasonItems(items, hemisphere, month).map(i => i.name);

// A run is consecutive months and wraps across December. All-year items have
// no start or end, so they stay regular; a one-month run counts as just in.
export const getSeasonStatus = (
  item: SeasonalItem,
  hemisphere: Hemisphere,
  month: number,
): SeasonStatus => {
  const noteMonth = toNoteMonth(hemisphere, month);
  if (!item.months.includes(noteMonth)) return SEASON_STATUS.REGULAR;
  const previous = ((noteMonth + MONTHS_IN_YEAR - 2) % MONTHS_IN_YEAR) + 1;
  const next = (noteMonth % MONTHS_IN_YEAR) + 1;
  if (!item.months.includes(previous)) return SEASON_STATUS.JUST_IN;
  if (!item.months.includes(next)) return SEASON_STATUS.LAST_CHANCE;
  return SEASON_STATUS.REGULAR;
};

// `month` is 1-12; `step` may be negative and wraps across December.
export const shiftMonth = (month: number, step: number): number =>
  ((((month - 1 + step) % MONTHS_IN_YEAR) + MONTHS_IN_YEAR) % MONTHS_IN_YEAR) +
  1;
