import unittest
from array.implement_queue_using_stacks import MyQueue


class TestSolution(unittest.TestCase):
    def test(self):
        res = []
        q = None
        commands = zip(
            ["MyQueue", "push", "push", "peek", "pop", "empty"],
            [[], [1], [2], [], [], []],
        )
        for command, val in commands:
            if command == "MyQueue":
                q = MyQueue()
                res.append(None)
            if command == "push":
                q.push(val[0])
                res.append(None)
            if command == "pop":
                res.append(q.pop())
            if command == "peek":
                res.append(q.peek())
            if command == "empty":
                res.append(q.empty())
        expected = [None, None, None, 1, 1, False]
        self.assertEqual(res, expected)
