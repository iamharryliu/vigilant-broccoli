import unittest
from string_lc_questions.find_all_anagrams import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.findAnagrams(s="cbaebabacd", p="abc")
        self.assertEqual(res, [0, 6])
        res = Solution.findAnagrams(s="abab", p="ab")
        self.assertEqual(res, [0, 1, 2])
