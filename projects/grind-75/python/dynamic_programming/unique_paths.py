class Solution:
    @classmethod
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n
        for _ in range(m - 1):
            for c in range(n - 2, -1, -1):
                dp[c] = dp[c + 1] + dp[c]
        return dp[0]
