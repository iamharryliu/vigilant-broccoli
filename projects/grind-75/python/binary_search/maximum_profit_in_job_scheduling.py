from typing import List


class Solution:
    @classmethod
    def jobScheduling(
        self, startTime: List[int], endTime: List[int], profit: List[int]
    ) -> int:
        ls = sorted(zip(startTime, endTime, profit), key=lambda x: x[1])
        dp = [[0, 0]]

        def find_pp(s):
            l, r = 0, len(dp) - 1

            while l <= r:
                m = (l + r) // 2
                e = dp[m][0]
                if e <= s:
                    l = m + 1
                else:
                    r = m - 1
            return dp[l - 1][1]

        for s, e, p in ls:
            pp = dp[-1][1]
            cp = find_pp(s) + p
            if cp > pp:
                dp.append([e, cp])
        return dp[-1][1]
