from typing import List


class Solution:
    @classmethod
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        dp = [False] * (len(s) + 1)
        dp[-1] = True
        for i in range(len(s) - 1, -1, -1):
            for word in wordDict:
                wordFits = (len(s) - i) >= len(word)
                if wordFits and word == s[i : i + len(word)] and dp[i + len(word)]:
                    dp[i] = True
        return dp[0]


s = "leetcode"
wordDict = ["leet", "code"]
output = True
res = Solution.wordBreak(s, wordDict)
print(res == output)

s = "applepenapple"
wordDict = ["apple", "pen"]
output = True
res = Solution.wordBreak(s, wordDict)
print(res == output)

s = "catsandog"
wordDict = ["cats", "dog", "sand", "and", "cat"]
output = False
res = Solution.wordBreak(s, wordDict)
print(res == output)
