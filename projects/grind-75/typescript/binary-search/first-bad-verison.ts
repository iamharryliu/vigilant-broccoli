export var solution = function (isBadVersion: any) {
  return function (n: number): number {
    let l = 1;
    let r = n;
    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      if (isBadVersion(mid)) {
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    }
    return l;
  };
};
