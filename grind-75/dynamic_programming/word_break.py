from typing import List


class Solution:
    @classmethod
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        dp = [False] * (len(s) + 1)
        dp[-1] = True
        for i in range(len(s) - 1, -1, -1):
            for word in wordDict:
                word_end_index = i + len(word)
                word_fits = len(s) >= word_end_index
                if word_fits and word == s[i:word_end_index] and dp[word_end_index]:
                    dp[i] = True
        return dp[0]
