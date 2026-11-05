from typing import List


class Solution:
    @classmethod
    def sortColors(self, nums: List[int]) -> None:
        curr = 0
        l = 0
        r = len(nums) - 1

        def swap(a, b):
            tmp = nums[b]
            nums[b] = nums[a]
            nums[a] = tmp

        while curr <= r:
            if nums[curr] == 0:
                swap(curr, l)
                l += 1
            if nums[curr] == 2:
                swap(curr, r)
                curr -= 1
                r -= 1
            curr += 1
