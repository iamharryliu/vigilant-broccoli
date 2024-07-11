class Solution:
    @classmethod
    def rob(self, nums):
        rob1, rob2 = 0, 0
        for num in nums:
            max_value = max(rob1 + num, rob2)
            rob1 = rob2
            rob2 = max_value
        return rob2


test_value = [1, 2, 3, 1]
res = Solution.rob(test_value)
print(res == 4)
