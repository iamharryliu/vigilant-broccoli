export type Locale = string;

export interface Dictionary {
  [key: string]: string | Dictionary;
}

export type InterpolationValues = Record<string, string | number>;

export type DotPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Dictionary
    ? DotPaths<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type TranslateFn<T> = (
  key: DotPaths<T>,
  values?: InterpolationValues,
) => string;

export interface I18nContextValue<T> {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn<T>;
}
