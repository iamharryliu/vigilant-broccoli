const EXPORT_PREFIX = 'export ';

function stripExportPrefix(line: string): string {
  const trimmed = line.trim();
  return trimmed.startsWith(EXPORT_PREFIX)
    ? trimmed.slice(EXPORT_PREFIX.length).trim()
    : trimmed;
}

function getJSONFromEnvironmentVariables(text: string) {
  const result: Record<string, string> = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = stripExportPrefix(line);
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
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

function getStubbedEnvironmentVariableKeys(envContent: string): string {
  const ENV_KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/i;

  return envContent
    .split(/\r?\n/)
    .map(stripExportPrefix)
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => line.split('=', 1)[0].trim())
    .filter(key => ENV_KEY_PATTERN.test(key))
    .map(key => `${key}=`)
    .join('\n');
}

function getStubbedJSONValues(jsonText: string): string {
  try {
    const obj = JSON.parse(jsonText?.trim());
    const stubbed = Object.fromEntries(Object.keys(obj).map(key => [key, '']));
    return JSON.stringify(stubbed, null, 2);
  } catch {
    return '';
  }
}

function formatBlockStringToSingleLineString(block: string): string {
  return block.split(/\r?\n/).join('\\n');
}

export const EnvUtils = {
  getPrettierJSON,
  getEnvironmentVariablesFromJSON,
  getJSONFromEnvironmentVariables,
  getStubbedEnvironmentVariableKeys,
  getStubbedJSONValues,
  formatBlockStringToSingleLineString,
};
