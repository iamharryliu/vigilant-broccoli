from typing import List


class Solution:
    @classmethod
    def letterCombinations(self, digits: str) -> List[str]:
        hmap = {
            "2": "abc",
            "3": "def",
            "4": "ghi",
            "5": "jkl",
            "6": "mno",
            "7": "pqrs",
            "8": "tuv",
            "9": "wxyz",
        }
        res = []

        def dfs(i, word):
            if len(word) == len(digits):
                res.append(word)
            else:
                for c in hmap[digits[i]]:
                    dfs(i + 1, word + c)

        if digits:
            dfs(0, "")
        return res


digits = "23"
output = ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]
res = Solution.letterCombinations(digits)
print(res == output)

digits = ""
output = []
res = Solution.letterCombinations(digits)
print(res == output)

digits = "2"
output = ["a", "b", "c"]
res = Solution.letterCombinations(digits)
print(res == output)
