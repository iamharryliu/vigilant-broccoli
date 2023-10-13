class Solution:
    @classmethod
    def countPalindromicSubstrings(self, s):
        res = 0
        for i in range(len(s)):
            # count off length palindromes
            res += self.countPalindromes(s, i, i)
            # count even length palindromes
            res += self.countPalindromes(s, i, i + 1)
        return res

    def countPalindromes(s, left, right):
        res = 0
        # while within bound and left and right is equal increment res
        while left >= 0 and right < len(s) and s[left] == s[right]:
            res += 1
            left -= 1
            right += 1
        return res

    # @classmethod
    # def countPalindromicSubstrings(self, s):
    #     n = len(s)
    #     dp = [[0] * n for _ in range(n)]

    #     res = 0
    #     for i in range(n - 1, -1, -1):
    #         for j in range(i, n):
    #             dp[i][j] = s[i] == s[j] and ((j - i + 1) < 3 or dp[i + 1][j - 1])
    #             res += dp[i][j]
    #     return res


res = Solution.countPalindromicSubstrings("aaa")
print(res)
