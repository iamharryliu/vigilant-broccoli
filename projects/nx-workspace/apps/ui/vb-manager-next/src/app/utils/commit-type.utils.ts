export const getCommitType = (title: string): string => {
  const withoutQuadrant = title.replace(/^Q[1-4][\s:]+/i, '');
  const match = withoutQuadrant.match(/^([\w&]+)[(:]/i);
  if (match) {
    return match[1].toLowerCase();
  }
  return 'other';
};
