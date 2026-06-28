import { Dictionary, InterpolationValues } from './i18n.types';

const KEY_SEPARATOR = '.';
const INTERPOLATION_PATTERN = /\{(\w+)\}/g;

export const resolveKey = (
  dictionary: Dictionary,
  key: string,
): string | undefined => {
  const value = key
    .split(KEY_SEPARATOR)
    .reduce<string | Dictionary | undefined>((acc, part) => {
      if (acc && typeof acc === 'object') return acc[part];
      return undefined;
    }, dictionary);
  return typeof value === 'string' ? value : undefined;
};

export const interpolate = (
  template: string,
  values?: InterpolationValues,
): string => {
  if (!values) return template;
  return template.replace(INTERPOLATION_PATTERN, (match, name) =>
    name in values ? String(values[name]) : match,
  );
};
