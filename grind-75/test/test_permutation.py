import unittest
from recursion.permutations import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.permute(nums=[1, 2, 3])
        self.assertEqual(
            res, [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
        )
        res = Solution.permute(nums=[0, 1])
        self.assertEqual(res, [[0, 1], [1, 0]])
        res = Solution.permute(nums=[1])
        self.assertEqual(res, [[1]])
