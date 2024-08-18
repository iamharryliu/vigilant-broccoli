export default function longestPalindrome(s: string): number {
  const s_count: { [c: string]: number } = {};
  for (const c of s) {
    s_count[c] = (s_count[c] || 0) + 1;
  }
  let res = 0;
  let hasOddAmountOfCharacters = false;
  for (const count of Object.values(s_count)) {
    if (count % 2 === 1) {
      hasOddAmountOfCharacters = true;
      res += count - 1;
    } else {
      res += count;
    }
  }
  return hasOddAmountOfCharacters ? res + 1 : res;
}
