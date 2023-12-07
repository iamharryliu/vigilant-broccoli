import unittest
from dynamic_programming.climbing_stairs import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.climbStairs(2)
        self.assertEqual(res, 2)
        res = Solution.climbStairs(3)
        self.assertEqual(res, 3)
