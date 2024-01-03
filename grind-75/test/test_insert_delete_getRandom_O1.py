import unittest
from hashmap.insert_delete_getRandom_O1 import RandomizedSet


class TestSolution(unittest.TestCase):
    def test(self):
        res = []
        data_set = None
        commands = zip(
            [
                "RandomizedSet",
                "insert",
                "remove",
                "insert",
                "getRandom",
                "remove",
                "insert",
                "getRandom",
            ],
            [[], [1], [2], [2], [], [1], [2], []],
        )
        for command, val in commands:
            if command == "RandomizedSet":
                data_set = RandomizedSet()
                res.append(None)
            if command == "insert":
                res.append(data_set.insert(val[0]))
            if command == "remove":
                res.append(data_set.remove(val[0]))
            if command == "getRandom":
                res.append(data_set.getRandom())
        expected = [None, True, False, True, 2, True, False, 2]
        self.assertEqual(res, expected)
