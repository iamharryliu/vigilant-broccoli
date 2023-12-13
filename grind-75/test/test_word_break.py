import unittest
from dynamic_programming.word_break import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.wordBreak(s="leetcode", wordDict=["leet", "code"])
        self.assertEqual(res, True)
        res = Solution.wordBreak(s="applepenapple", wordDict=["apple", "pen"])
        self.assertEqual(res, True)
        res = Solution.wordBreak(
            s="catsandog", wordDict=["cats", "dog", "sand", "and", "cat"]
        )
        self.assertEqual(res, False)
