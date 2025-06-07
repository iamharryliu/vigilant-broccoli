export * from './lib/node-environment/node-environment.consts';
export * from './lib/http/http.consts';
export * from './lib/location/location.model';

export function getJSONFromEnvironmentVariables(text: string) {
  const result: Record<string, string> = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue; // Skip empty lines and comments
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    // Remove surrounding quotes if any
    result[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return result;
}

export function getEnvironmentVariablesFromJSON(text: string): string {
  try {
    const obj = JSON.parse(text?.trim());
    return Object.entries(obj as Record<string, string>)
      .map(([key, value]) => {
        // Quote value if it contains spaces or special characters
        const needsQuotes = /[\s"'`$\\]/.test(value);
        const safeValue = needsQuotes
          ? `"${value.replace(/"/g, '\\"')}"`
          : value;
        return `${key}=${safeValue}`;
      })
      .join('\n');
  } catch {
    return '';
  }
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
} as const;

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE];
