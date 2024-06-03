class Solution:
    @classmethod
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n
        for _ in range(m - 1):
            for i in range(n - 2, -1, -1):
                dp[i] = dp[i + 1] + dp[i]
        return dp[0]
