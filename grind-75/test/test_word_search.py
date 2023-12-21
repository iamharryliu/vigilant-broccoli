import unittest
from matrix.word_search import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.exist(
            board=[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
            word="ABCCED",
        )
        expected = True
        self.assertEqual(res, expected)
        res = Solution.exist(
            board=[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
            word="SEE",
        )
        expected = True
        self.assertEqual(res, expected)
        res = Solution.exist(
            board=[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
            word="ABCB",
        )
        expected = False
        self.assertEqual(res, expected)
