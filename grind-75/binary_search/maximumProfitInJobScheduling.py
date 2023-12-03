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


startTime = [1, 2, 3, 3]
endTime = [3, 4, 5, 6]
profit = [50, 10, 40, 70]
output = 120
res = Solution.jobScheduling(startTime, endTime, profit)
print(res == output)

startTime = [1, 2, 3, 4, 6]
endTime = [3, 5, 10, 6, 9]
profit = [20, 20, 100, 70, 60]
output = 150
res = Solution.jobScheduling(startTime, endTime, profit)
print(res == output)

startTime = [1, 1, 1]
endTime = [2, 3, 4]
profit = [5, 6, 4]
output = 6
res = Solution.jobScheduling(startTime, endTime, profit)
print(res == output)
