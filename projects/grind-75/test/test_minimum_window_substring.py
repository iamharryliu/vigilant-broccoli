import unittest
from string_lc_questions.minumum_window_substring import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        s = "ADOBECODEBANC"
        t = "ABC"
        expected = "BANC"
        res = Solution.minWindow(s, t)
        self.assertEqual(res, expected)

        s = "a"
        t = "a"
        expected = "a"
        res = Solution.minWindow(s, t)
        self.assertEqual(res, expected)

        s = "a"
        t = "aa"
        expected = ""
        res = Solution.minWindow(s, t)
        self.assertEqual(res, expected)
