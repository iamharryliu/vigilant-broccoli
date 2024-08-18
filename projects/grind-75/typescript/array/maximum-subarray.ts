export default function maxSubArray(nums: number[]): number {
  let res = -Infinity;
  let curr = 0;

  for (const num of nums) {
    curr = Math.max(curr + num, num);
    res = Math.max(res, curr);
  }
  return res;
}
