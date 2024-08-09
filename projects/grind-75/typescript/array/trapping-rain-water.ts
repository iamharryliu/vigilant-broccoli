export function trap(height: number[]): number {
  let res = 0;
  let l = 0;
  let r = height.length - 1;
  let lmax = height[l];
  let rmax = height[r];
  while (l < r) {
    if (lmax < rmax) {
      l += 1;
      lmax = Math.max(lmax, height[l]);
      res += lmax - height[l];
    } else {
      r -= 1;
      rmax = Math.max(rmax, height[r]);
      res += rmax - height[r];
    }
  }
  return res;
}
