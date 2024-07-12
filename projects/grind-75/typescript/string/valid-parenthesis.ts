export function isValid(s: string): boolean {
  const stack: string[] = [];
  const hmap: { [key: string]: string } = { ']': '[', '}': '{', ')': '(' };

  for (const c of s) {
    if (Object.values(hmap).includes(c)) {
      stack.push(c);
    } else if (Object.keys(hmap).includes(c)) {
      if (!stack || hmap[c] !== stack.pop()) {
        return false;
      }
    } else {
      return false;
    }
  }
  return stack.length === 0;
}
