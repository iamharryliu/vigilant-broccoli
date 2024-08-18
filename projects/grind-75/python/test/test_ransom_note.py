import unittest
from string_lc_questions.ransom_note import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.canConstruct(ransomNote="a", magazine="b")
        self.assertEqual(res, False)
        res = Solution.canConstruct(ransomNote="aa", magazine="ab")
        self.assertEqual(res, False)
        res = Solution.canConstruct(ransomNote="aa", magazine="aab")
        self.assertEqual(res, True)
