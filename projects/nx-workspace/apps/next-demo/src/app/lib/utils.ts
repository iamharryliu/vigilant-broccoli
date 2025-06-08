export function getPrettierJSON(jsonText: string): string {
  try {
    const jsonObj = JSON.parse(jsonText);
    return JSON.stringify(jsonObj, null, 2);
  } catch {
    return '';
  }
}
