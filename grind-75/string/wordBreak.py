from typing import List


class Solution:
    @classmethod
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        dp = [False] * (len(s) + 1)
        dp[len(s)] = True

        for i in range(len(s) - 1, -1, -1):
            for w in wordDict:
                w_fits_in_s = (i + len(w)) <= len(s)
                if w_fits_in_s and s[i : i + len(w)] == w:
                    dp[i] = dp[i + len(w)]
                if dp[i]:
                    break

        return dp[0]


print(Solution.wordBreak(s="leetcode", wordDict=["leet", "code"]))
