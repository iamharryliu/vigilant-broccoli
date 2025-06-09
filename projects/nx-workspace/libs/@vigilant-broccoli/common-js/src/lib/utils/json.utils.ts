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
