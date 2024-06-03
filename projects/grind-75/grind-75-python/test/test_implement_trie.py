import unittest
from trie.implement_trie import Trie


class TestSolution(unittest.TestCase):
    def test(self):
        res = []
        commands = zip(
            ["Trie", "insert", "search", "search", "startsWith", "insert", "search"],
            [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]],
        )
        for command, val in commands:
            if command == "Trie":
                trie = Trie()
                res.append(None)
            if command == "insert":
                trie.insert(val[0])
                res.append(None)
            if command == "search":
                res.append(trie.search(val[0]))
            if command == "startsWith":
                res.append(trie.startsWith(val[0]))
            if command == "empty":
                res.append(q.empty())
        self.assertEqual(res, [None, None, True, False, True, None, True])
