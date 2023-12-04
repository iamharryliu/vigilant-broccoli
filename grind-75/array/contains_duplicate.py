class Solution:
    @classmethod
    def containsDuplicate(self, nums) -> bool:
        # Compare set and len.
        return len(set(nums)) != len(nums)

        # Track using set.
        # hmap = {}
        # for num in nums:
        #     if num in hmap:
        #         return True
        #     hmap[num]=True
        # return False
