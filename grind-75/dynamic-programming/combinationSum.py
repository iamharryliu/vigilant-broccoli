class Solution:
    @classmethod
    def combinationSum4(self, nums, target):
        dp = {0: 1}  # tracks number of permutations per value
        for total in range(1, target + 1):
            dp[total] = 0
            for n in nums:
                dp[total] += dp.get(total - n, 0)
        return dp[target]


res = Solution.combinationSum4([1, 2, 3], 4)
print(res)
