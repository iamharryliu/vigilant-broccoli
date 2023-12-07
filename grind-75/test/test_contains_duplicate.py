import unittest
from array.contains_duplicate import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.containsDuplicate(nums=[1, 2, 3, 1])
        self.assertEqual(res, True)
        res = Solution.containsDuplicate(nums=[1, 2, 3, 4])
        self.assertEqual(res, False)
        res = Solution.containsDuplicate(nums=[1, 1, 1, 3, 3, 4, 3, 2, 4, 2])
        self.assertEqual(res, True)
