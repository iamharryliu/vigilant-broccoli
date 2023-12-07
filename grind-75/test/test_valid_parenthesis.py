import unittest
from string.valid_parenthesis import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.isValid(s="()")
        self.assertEqual(res, True)
        res = Solution.isValid(s="()[]{}")
        self.assertEqual(res, True)
        res = Solution.isValid(s="(]")
        self.assertEqual(res, False)
