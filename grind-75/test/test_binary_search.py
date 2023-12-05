import unittest
from binary_search.binary_search import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.search(nums=[-1, 0, 3, 5, 9, 12], target=9)
        self.assertEqual(res, 4)
        res = Solution.search(nums=[-1, 0, 3, 5, 9, 12], target=2)
        self.assertEqual(res, -1)


if __name__ == "__main__":
    unittest.main()
