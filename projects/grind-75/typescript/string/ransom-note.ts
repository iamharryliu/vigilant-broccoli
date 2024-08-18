export default function canConstruct(
  ransomNote: string,
  magazine: string,
): boolean {
  const ransomCount: { [char: string]: number } = {};
  const magazineCount: { [char: string]: number } = {};

  for (const c of ransomNote) {
    ransomCount[c] = (ransomCount[c] || 0) + 1;
  }
  for (const c of magazine) {
    magazineCount[c] = (magazineCount[c] || 0) + 1;
  }
  for (const c of ransomNote) {
    if ((magazineCount[c] || 0) < ransomCount[c]) {
      return false;
    }
  }
  return true;
}
