import unittest
from mathematics.palindrome_number import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.isPalindrome(x=121)
        expected = True
        self.assertEqual(res, expected)
        res = Solution.isPalindrome(x=-121)
        expected = False
        self.assertEqual(res, expected)
        res = Solution.isPalindrome(x=10)
        expected = False
        self.assertEqual(res, expected)
