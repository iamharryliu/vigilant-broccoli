import unittest
from stack.basic_calculator import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.calculate(s="1 + 1")
        expected = 2
        self.assertEqual(res, expected)
        res = Solution.calculate(s=" 2-1 + 2 ")
        expected = 3
        self.assertEqual(res, expected)
        res = Solution.calculate(s="(1+(4+5+2)-3)+(6+8)")
        expected = 23
        self.assertEqual(res, expected)
