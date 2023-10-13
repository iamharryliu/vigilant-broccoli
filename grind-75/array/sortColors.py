from typing import List


class Solution:
    @classmethod
    def sortColors(self, nums: List[int]) -> None:
        def swap(a, b):
            tmp = nums[b]
            nums[b] = nums[a]
            nums[a] = tmp

        i = 0
        l = 0
        r = len(nums) - 1
        while i <= r:
            if nums[i] == 0:
                swap(i, l)
                l += 1
            if nums[i] == 2:
                swap(i, r)
                r -= 1
                i -= 1  # we are swapping 2 for an unknown number so we do not want to increment i
            i += 1


arr = [2, 0, 2, 1, 1, 0]
Solution.sortColors(arr)
print(arr == [0, 0, 1, 1, 2, 2])
