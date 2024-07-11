import unittest
from string_lc_questions.longest_palindromic_substring import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        result = Solution.longestPalindrome(s="babad")
        expected = "bab"
        self.assertEqual(result, expected)

        result = Solution.longestPalindrome(s="cbbd")
        expected = "bb"
        self.assertEqual(result, expected)
