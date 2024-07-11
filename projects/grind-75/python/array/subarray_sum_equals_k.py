from typing import List


class Solution:
    @classmethod
    def subarraySum(self, nums: List[int], k: int) -> int:
        res = 0
        curr = 0
        hmap = {0: 1}

        for num in nums:
            curr += num
            if curr - k in hmap:
                res = res + hmap[curr - k]
            hmap[curr] = hmap.get(curr, 0) + 1

        return res
