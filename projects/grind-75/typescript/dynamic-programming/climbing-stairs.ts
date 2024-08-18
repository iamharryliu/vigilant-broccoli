export default function climbStairs(n: number): number {
  if (n === 1) {
    return 1;
  }
  let n_minus_2 = 1;
  let n_minus_1 = 2;
  for (let i = 3; i <= n; i++) {
    const tmp = n_minus_1;
    n_minus_1 = n_minus_2 + n_minus_1;
    n_minus_2 = tmp;
  }
  return n_minus_1;
}
