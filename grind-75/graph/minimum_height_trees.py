from collections import defaultdict, deque
from typing import List


class Solution:
    @classmethod
    def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:
        if n == 1:
            return [0]

        graph = defaultdict(list)
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)

        q = deque([key for key, val in graph.items() if len(val) == 1])

        while n > 2:
            n -= len(q)
            for new_edge in range(len(q)):
                edge = q.popleft()
                for new_edge in graph[edge]:
                    graph[new_edge].remove(edge)
                    if len(graph[new_edge]) == 1:
                        q.append(new_edge)

        return list(q)
