import unittest
from array.majority_element import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.majorityElement([3, 2, 3])
        self.assertEqual(res, 3)
        res = Solution.majorityElement([2, 2, 1, 1, 1, 2, 2])
        self.assertEqual(res, 2)
