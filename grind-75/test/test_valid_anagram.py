import unittest
from string.valid_anagram import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.isAnagram(s="anagram", t="nagaram")
        self.assertEqual(res, True)
        res = Solution.isAnagram(s="rat", t="car")
        self.assertEqual(res, False)


if __name__ == "__main__":
    unittest.main()
