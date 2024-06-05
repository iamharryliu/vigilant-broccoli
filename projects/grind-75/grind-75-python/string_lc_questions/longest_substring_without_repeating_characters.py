class Solution:
    @classmethod
    def lengthOfLongestSubstring(self, s: str) -> int:
        c_index = {}
        left = 0
        res = 0
        for right, c in enumerate(s):
            if c in c_index and left <= c_index[c]:
                left = c_index[c] + 1
            c_index[c] = right
            res = max(res, right - left + 1)
        return res


"""
Time Complexity - O(n)
Space Complexity - O(n)
"""
