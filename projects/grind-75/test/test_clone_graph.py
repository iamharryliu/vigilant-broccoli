import unittest

from graph.clone_graph import Solution
from graph.common import build_graph, get_adjacenly_list


class TestSolution(unittest.TestCase):
    def test(self):
        adjList = [[2, 4], [1, 3], [2, 4], [1, 3]]
        graph = build_graph(adjList)
        res = get_adjacenly_list(Solution.cloneGraph(graph))
        expected = [[2, 4], [1, 3], [2, 4], [1, 3]]
        self.assertEqual(res, expected)

        adjList = [[]]
        graph = build_graph(adjList)
        res = get_adjacenly_list(Solution.cloneGraph(graph))
        expected = [[]]
        self.assertEqual(res, expected)

        adjList = []
        graph = build_graph(adjList)
        res = get_adjacenly_list(Solution.cloneGraph(graph))
        expected = []
        self.assertEqual(res, expected)
