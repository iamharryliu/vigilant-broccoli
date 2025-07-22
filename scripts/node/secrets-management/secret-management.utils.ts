// TODO: common-js
export function getEnvironmentVariablesFromJSON(text: string): string {
  const obj = JSON.parse(text?.trim());
  return Object.entries(obj as Record<string, string>)
    .map(([key, value]) => {
      // Quote value if it contains spaces or special characters
      const needsQuotes = /[\s"'`$\\]/.test(value);
      const safeValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
      return `${key}=${safeValue}`;
    })
    .join('\n');
}
