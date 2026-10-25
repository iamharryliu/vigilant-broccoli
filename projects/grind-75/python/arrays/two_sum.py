from typing import List


class Solution:
    @classmethod
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        store = {}
        for i, num in enumerate(nums):
            if num in store:
                return [store[num], i]
            store[target - num] = i
