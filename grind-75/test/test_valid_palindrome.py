import unittest
from string_lc_questions.valid_palindrome import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.isPalindrome(s="A man, a plan, a canal: Panama")
        self.assertEqual(res, True)
        res = Solution.isPalindrome(s="race a car")
        self.assertEqual(res, False)
        res = Solution.isPalindrome(s=" ")
        self.assertEqual(res, True)
