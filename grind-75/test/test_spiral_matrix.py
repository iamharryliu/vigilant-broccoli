import unittest
from matrix.spiral_matrix import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.spiralOrder(matrix=[[1, 2, 3], [4, 5, 6], [7, 8, 9]])
        self.assertEqual(res, [1, 2, 3, 6, 9, 8, 7, 4, 5])
        res = Solution.spiralOrder(matrix=[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])
        self.assertEqual(res, [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7])
