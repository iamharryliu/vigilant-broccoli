import unittest
from binary.add_binary import Solution


class TestStringMethods(unittest.TestCase):
    def test(self):
        res = Solution.addBinary("11", "1")
        self.assertEqual(res, "100")
        res = Solution.addBinary("1010", "1011")
        self.assertEqual(res, "10101")


if __name__ == "__main__":
    unittest.main()
