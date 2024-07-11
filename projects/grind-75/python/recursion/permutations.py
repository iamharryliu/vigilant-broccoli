from typing import List


class Solution:
    @classmethod
    def permute(self, nums: List[int]) -> List[List[int]]:
        res = []

        def backtrack(curr=[]):
            if len(curr) == len(nums):
                res.append(curr[:])
                return
            for num in nums:
                if num not in curr:
                    curr.append(num)
                    backtrack(curr)
                    curr.pop()

        backtrack()
        return res


"""
Time Complexity - O(n × n!)
Space Complexity - O(n × n!)
"""
