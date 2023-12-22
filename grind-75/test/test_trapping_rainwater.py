import unittest
from array.trapping_rain_water import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.trap(height=[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])
        expected = 6
        self.assertEqual(res, expected)

        res = Solution.trap(height=[4, 2, 0, 3, 2, 5])
        expected = 9
        self.assertEqual(res, expected)
