import unittest
from matrix.flood_fill import Solution


class TestStringMethods(unittest.TestCase):
    def test(self):
        res = Solution.floodFill(
            image=[[1, 1, 1], [1, 1, 0], [1, 0, 1]], sr=1, sc=1, color=2
        )
        self.assertEqual(res, [[2, 2, 2], [2, 2, 0], [2, 0, 1]])
        res = Solution.floodFill(image=[[0, 0, 0], [0, 0, 0]], sr=0, sc=0, color=0)
        self.assertEqual(res, [[0, 0, 0], [0, 0, 0]])


if __name__ == "__main__":
    unittest.main()
