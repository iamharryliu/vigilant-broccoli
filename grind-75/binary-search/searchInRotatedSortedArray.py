class Solution:
    @classmethod
    def search(self, nums, target):
        l, r = 0, len(nums) - 1
        while l <= r:
            m = (l + r) // 2
            if target == nums[m]:
                return m
            if nums[l] <= nums[m]:
                if nums[m] < target or target < nums[l]:
                    l = m + 1
                else:
                    r = m - 1
            else:
                if target < nums[m] or nums[r] < target:
                    r = m - 1
                else:
                    l = m + 1
        return -1


res = Solution.search([4, 5, 6, 7, 0, 1, 2], 0)
expected_res = 4
print(res == expected_res)
