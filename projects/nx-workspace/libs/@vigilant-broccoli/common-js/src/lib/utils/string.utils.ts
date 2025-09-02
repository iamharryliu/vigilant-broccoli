export function toSlug(input: string): string {
  return input.toLowerCase().replace(/ /g, '-');
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
