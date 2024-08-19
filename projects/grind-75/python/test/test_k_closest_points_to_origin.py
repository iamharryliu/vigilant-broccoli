import unittest
from heap.k_closest_points_to_origin import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.kClosest(points=[[1, 3], [-2, 2]], k=1)
        self.assertEqual(res, [[-2, 2]])
        res = Solution.kClosest(points=[[3, 3], [5, -1], [-2, 4]], k=2)
        self.assertCountEqual(res, [[3, 3], [-2, 4]])
