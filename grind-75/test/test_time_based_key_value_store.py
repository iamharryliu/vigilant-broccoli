import unittest
from binary_search.time_based_key_value_store import TimeMap


class TestSolution(unittest.TestCase):
    def test(self):
        res = []
        commands = zip(
            ["TimeMap", "set", "get", "get", "set", "get", "get"],
            [
                [],
                ["foo", "bar", 1],
                ["foo", 1],
                ["foo", 3],
                ["foo", "bar2", 4],
                ["foo", 4],
                ["foo", 5],
            ],
        )
        for command, val in commands:
            if command == "TimeMap":
                timemap = TimeMap()
                res.append(None)
            if command == "set":
                key, value, timestamp = val
                timemap.set(key, value, timestamp)
                res.append(None)
            if command == "get":
                key, timestamp = val
                res.append(timemap.get(key, timestamp))
        self.assertEqual(res, [None, None, "bar", "bar", None, "bar2", "bar2"])
