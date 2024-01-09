import unittest
from array.min_stack import MinStack


class TestSolution(unittest.TestCase):
    def test(self):
        res = []
        stack = None
        commands = zip(
            ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
            [[], [-2], [0], [-3], [], [], [], []],
        )
        for command, val in commands:
            if command == "MinStack":
                stack = MinStack()
                res.append(None)
            if command == "push":
                res.append(stack.push(val[0]))
            if command == "pop":
                res.append(stack.pop())
            if command == "top":
                res.append(stack.top())
            if command == "getMin":
                res.append(stack.getMin())
        self.assertEqual(res, [None, None, None, None, -3, None, 0, -2])
