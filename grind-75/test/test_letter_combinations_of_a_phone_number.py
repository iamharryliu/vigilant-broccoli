import unittest
from backtracking.letter_combinations_of_a_phone_number import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        result = Solution.letterCombinations(digits="23")
        expected = ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]
        self.assertEqual(result, expected)

        result = Solution.letterCombinations(digits="")
        expected = []
        self.assertEqual(result, expected)

        result = Solution.letterCombinations(digits="2")
        expected = ["a", "b", "c"]
        self.assertEqual(result, expected)
