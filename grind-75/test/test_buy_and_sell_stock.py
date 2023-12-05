import unittest
from array.best_time_to_buy_and_sell_stock import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.maxProfit(prices=[7, 1, 5, 3, 6, 4])
        self.assertEqual(res, 5)
        res = Solution.maxProfit(prices=[7, 6, 4, 3, 1])
        self.assertEqual(res, 0)


if __name__ == "__main__":
    unittest.main()
