import unittest
from graph.zero_one_matrix import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.updateMatrix(mat=[[0, 0, 0], [0, 1, 0], [0, 0, 0]])
        self.assertEqual(res, [[0, 0, 0], [0, 1, 0], [0, 0, 0]])
        res = Solution.updateMatrix(mat=[[0, 0, 0], [0, 1, 0], [1, 1, 1]])
        self.assertEqual(res, [[0, 0, 0], [0, 1, 0], [1, 2, 1]])


if __name__ == "__main__":
    unittest.main()
