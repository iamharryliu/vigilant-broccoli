import unittest
from stack.evaluate_reverse_polish_notation import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.evalRPN(tokens=["2", "1", "+", "3", "*"])
        self.assertEqual(res, 9)
        res = Solution.evalRPN(tokens=["4", "13", "5", "/", "+"])
        self.assertEqual(res, 6)
        res = Solution.evalRPN(
            tokens=["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]
        )
        self.assertEqual(res, 22)


if __name__ == "__main__":
    unittest.main()
