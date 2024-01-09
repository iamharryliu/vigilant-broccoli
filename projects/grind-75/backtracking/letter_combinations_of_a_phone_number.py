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

        def backtrack(i, word):
            if len(word) == len(digits):
                res.append(word)
            else:
                for c in hmap[digits[i]]:
                    backtrack(i + 1, word + c)

        if digits:
            backtrack(0, "")
        return res
