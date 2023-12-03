import unittest
from string.valid_parenthesis import Solution


class TestStringMethods(unittest.TestCase):
    def test(self):
        res = Solution.isValid(s="()")
        self.assertEqual(res, True)
        res = Solution.isValid(s="()[]{}")
        self.assertEqual(res, True)
        res = Solution.isValid(s="(]")
        self.assertEqual(res, False)


if __name__ == "__main__":
    unittest.main()
