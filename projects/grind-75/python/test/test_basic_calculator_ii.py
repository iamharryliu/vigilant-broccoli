import unittest
from stack.basic_calculator_ii import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.calculate(s="3+2*2")
        expected = 7
        self.assertEqual(res, expected)
        res = Solution.calculate(s=" 3/2 ")
        expected = 1
        self.assertEqual(res, expected)
        res = Solution.calculate(s=" 3+5 / 2 ")
        expected = 5
        self.assertEqual(res, expected)
