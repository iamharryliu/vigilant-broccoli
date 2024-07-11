export function twoSum(nums: number[], target: number): number[] {
  const store = new Map<number, number>();
  for (let [i, num] of nums.entries()) {
    if (store.has(num)) {
      return [store.get(num)!, i];
    }
    store.set(target - num, i);
  }
  return [];
}
