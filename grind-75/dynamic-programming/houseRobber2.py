class Solution:
    @classmethod
    def rob(self, nums):
        def helper(nums):  # from house robber 1
            rob1, rob2 = 0, 0
            for num in nums:
                max_value = max(rob1 + num, rob2)
                rob1 = rob2
                rob2 = max_value
            return rob2

        return max(nums[0], helper(nums[1:]), helper(nums[:-1]))


test_value = [2, 3, 2]
res = Solution.rob(test_value)
print(res == 3)
