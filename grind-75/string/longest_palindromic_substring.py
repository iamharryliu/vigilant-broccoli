class Solution:
    @classmethod
    def longestPalindrome(self, s):
        res = ""

        def helper(l, r):
            nonlocal res
            if l >= 0 and r < len(s) and s[l] == s[r]:
                word = s[l : r + 1]
                res = word if len(word) > len(res) else res
                helper(l - 1, r + 1)

        for i in range(len(s)):
            helper(i, i)
            helper(i, i + 1)

        return res
