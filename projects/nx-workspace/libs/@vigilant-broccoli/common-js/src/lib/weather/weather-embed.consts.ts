// weather-next's embed page and local-manager-next's home card talk over
// postMessage: the frame announces READY, the parent answers with its THEME
// (and again on every change), and the frame then reports its content HEIGHT.
export const WEATHER_EMBED = {
  PATH: '/embed',
  MESSAGE: {
    READY: 'weather-embed-ready',
    THEME: 'weather-embed-theme',
    HEIGHT: 'weather-embed-height',
  },
} as const;

export const WEATHER_EMBED_APPEARANCE = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type WeatherEmbedAppearance =
  (typeof WEATHER_EMBED_APPEARANCE)[keyof typeof WEATHER_EMBED_APPEARANCE];

export type WeatherEmbedMessage =
  | { type: typeof WEATHER_EMBED.MESSAGE.READY }
  | {
      type: typeof WEATHER_EMBED.MESSAGE.THEME;
      appearance: WeatherEmbedAppearance;
    }
  | { type: typeof WEATHER_EMBED.MESSAGE.HEIGHT; height: number };

const MESSAGE_TYPES: readonly string[] = Object.values(WEATHER_EMBED.MESSAGE);

export const isWeatherEmbedMessage = (
  data: unknown,
): data is WeatherEmbedMessage =>
  typeof data === 'object' &&
  data !== null &&
  MESSAGE_TYPES.includes((data as { type?: unknown }).type as string);
