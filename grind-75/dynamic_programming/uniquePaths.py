class Solution:
    @classmethod
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n
        for _ in range(m - 1):
            for i in range(n - 2, -1, -1):
                dp[i] = dp[i + 1] + dp[i]
        return dp[0]


m = 3
n = 7
output = 28
res = Solution.uniquePaths(m, n)
print(res == output)

m = 3
n = 2
output = 3
res = Solution.uniquePaths(m, n)
print(res == output)
