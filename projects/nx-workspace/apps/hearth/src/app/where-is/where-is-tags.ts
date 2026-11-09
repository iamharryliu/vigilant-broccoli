export const sortTags = (tags: string[]): string[] =>
  [...tags].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
