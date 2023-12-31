import unittest
from string_lc_questions.longest_palindrome import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.longestPalindrome("abccccdd")
        self.assertEqual(res, 7)
        res = Solution.longestPalindrome("a")
        self.assertEqual(res, 1)
