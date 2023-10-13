import math


class Solution:
    @classmethod
    def coinChange(self, coins, amount):
        dp = [math.inf] * (amount + 1)
        dp[0] = 0
        for a in range(1, amount + 1):
            for coin in coins:
                if a - coin >= 0:
                    dp[a] = min(dp[a], 1 + dp[a - coin])
        return dp[amount] if dp[amount] != math.inf else -1


result = Solution.coinChange([1, 2, 5], 11)
print(result)
