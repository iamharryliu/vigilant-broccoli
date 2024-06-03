function twoSum(nums: number[], target: number): number[] {
  const store = {};
  for (let [i, num] of nums.entries()) {
    if (num in store) {
      return [store[num], i];
    }
    store[target - num] = i;
  }
  return [];
}
