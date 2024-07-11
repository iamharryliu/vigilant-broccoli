class Solution:
    @classmethod
    def longestPalindrome(self, s: str) -> int:
        """
        :type s: str
        :rtype: int
        """
        res = 0
        foundOdd = False
        for c in set(s):
            countC = s.count(c)
            if countC % 2 == 1:
                foundOdd = True
                countC -= 1
            res += countC
        return res + 1 if foundOdd else res
