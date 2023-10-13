class Solution:
    @classmethod
    def lengthOfLongestSubstring(self, s: str) -> int:
        curr = ""
        res = 0
        for c in s:
            if c in curr:
                i = curr.index(c)
                curr = curr[i + 1 :]
            curr += c
            res = max(res, len(curr))
        return res


test = "abcabcbb"
expected_res = 3
print(Solution.lengthOfLongestSubstring(test) == expected_res)
