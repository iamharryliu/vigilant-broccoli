import unittest
from string_lc_questions.string_to_integer import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.myAtoi(s="42")
        self.assertEqual(res, 42)
        res = Solution.myAtoi(s="   -42")
        self.assertEqual(res, -42)
        res = Solution.myAtoi(s="4193 with words")
        self.assertEqual(res, 4193)
