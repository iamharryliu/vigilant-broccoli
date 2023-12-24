import unittest
from graph.word_ladder import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.ladderLength(
            beginWord="hit",
            endWord="cog",
            wordList=["hot", "dot", "dog", "lot", "log", "cog"],
        )
        expected = 5
        self.assertEqual(res, expected)
        res = Solution.ladderLength(
            beginWord="hit", endWord="cog", wordList=["hot", "dot", "dog", "lot", "log"]
        )
        expected = 0
        self.assertEqual(res, expected)
