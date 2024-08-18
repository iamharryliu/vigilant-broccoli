export default function threeSum(nums: number[]): number[][] {
  const res: number[][] = [];
  nums.sort((a, b) => a - b);
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    if (i > 0 && num === nums[i - 1]) continue;
    let l = i + 1;
    let r = nums.length - 1;
    while (l < r) {
      const total = num + nums[l] + nums[r];
      if (total < 0) {
        l++;
      }
      if (total > 0) {
        r--;
      }
      if (total === 0) {
        res.push([num, nums[l], nums[r]]);
        l++;
        r--;
        while (l < r && nums[l] === nums[l - 1]) {
          l++;
        }
        while (l < r && nums[r] === nums[r + 1]) {
          r--;
        }
      }
    }
  }

  return res;
}
