function getJSONFromEnvironmentVariables(text: string) {
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

function getEnvironmentVariablesFromJSON(text: string): string {
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

function getPrettierJSON(jsonText: string): string {
  try {
    const jsonObj = JSON.parse(jsonText);
    return JSON.stringify(jsonObj, null, 2);
  } catch {
    return '';
  }
}

function getClearedEnvValues(envContent: string): string {
  return envContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Skip comments, blank lines, and anything without '='
      if (
        line === '' ||
        line.startsWith('#') ||
        !line.includes('=')
      ) {
        return false;
      }

      // Extract key from before first '='
      const [key] = line.split('=', 1);

      // Match valid env variable names: letters, numbers, underscores, cannot start with number
      return /^[A-Z_][A-Z0-9_]*$/i.test(key.trim());
    })
    .map(line => {
      const [key] = line.split('=', 1);
      return `${key.trim()}=`;
    })
    .join('\n');
}

function formatBlockStringToSingleString(block: string): string {
  return block.split(/\r?\n/).join('\\n');
}



export const EnvUtils = {
  getPrettierJSON,
  getEnvironmentVariablesFromJSON,
  getJSONFromEnvironmentVariables,
  getClearedEnvValues,
  formatBlockStringToSingleString,
}