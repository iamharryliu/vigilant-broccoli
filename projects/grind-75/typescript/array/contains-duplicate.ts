export default function containsDuplicate(nums: number[]): boolean {
  const hmap = new Set<number>();
  for (const num of nums) {
    if (hmap.has(num)) {
      return true;
    }
    hmap.add(num);
  }
  return false;
}
