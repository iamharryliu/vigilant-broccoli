import unittest
from string.longest_substring_without_repeating_characters import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.lengthOfLongestSubstring(s="abcabcbb")
        self.assertEqual(res, 3)
        res = Solution.lengthOfLongestSubstring(s="bbbbb")
        self.assertEqual(res, 1)
        res = Solution.lengthOfLongestSubstring(s="pwwkew")
        self.assertEqual(res, 3)


if __name__ == "__main__":
    unittest.main()
