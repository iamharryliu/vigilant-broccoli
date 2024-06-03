import unittest
from dynamic_programming.coin_change import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.coinChange(coins=[1, 2, 5], amount=11)
        self.assertEqual(res, 3)
        res = Solution.coinChange(coins=[2], amount=3)
        self.assertEqual(res, -1)
        res = Solution.coinChange(coins=[1], amount=0)
        self.assertEqual(res, 0)
