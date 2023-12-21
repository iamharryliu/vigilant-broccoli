import unittest
from linked_list.lru_cache import LRUCache


class TestSolution(unittest.TestCase):
    def test(self):
        res = []
        cache = None
        commands = zip(
            ["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"],
            [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        )
        for command, val in commands:
            if command == "LRUCache":
                cache = LRUCache(val[0])
                res.append(None)
            if command == "put":
                cache.put(val[0], val[1])
                res.append(None)
            if command == "get":
                res.append(cache.get(val[0]))
        expected = [None, None, None, 1, None, -1, None, -1, 3, 4]
        self.assertEqual(res, expected)
