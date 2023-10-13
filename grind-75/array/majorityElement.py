from typing import List


class Solution:
    @classmethod
    def majorityElement(self, nums: List[int]) -> int:
        hmap = {}
        for num in nums:
            hmap[num] = hmap.get(num, 0) + 1
            if hmap[num] > len(nums) // 2:
                return num


print(Solution.majorityElement([3, 2, 3]) == 3)
