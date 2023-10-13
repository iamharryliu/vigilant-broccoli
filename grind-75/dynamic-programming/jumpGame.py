class Solution:
    @classmethod
    def canJump(self, nums):
        target = len(nums) - 1
        for i in range(len(nums) - 1, -1, -1):
            if target <= i + nums[i]:
                target = i
        return True if target == 0 else False


test_value = [2, 3, 1, 1, 4]
res = Solution.canJump(test_value)
print(res)
