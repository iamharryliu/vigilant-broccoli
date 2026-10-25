class Solution:
    @classmethod
    def containsDuplicate(self, nums) -> bool:
        hmap = {}
        for num in nums:
            if num in hmap:
                return True
            hmap[num] = True
        return False
