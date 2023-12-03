import unittest
from dynamic_programming.climb_stairs import Solution


class TestStringMethods(unittest.TestCase):
    def test(self):
        res = Solution.climbStairs(2)
        self.assertEqual(res, 2)
        res = Solution.climbStairs(3)
        self.assertEqual(res, 3)


if __name__ == "__main__":
    unittest.main()
