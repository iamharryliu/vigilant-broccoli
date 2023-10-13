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

n = 4
edges = [[1,0],[1,2],[1,3]]
output = [1]
res = Solution.findMinHeightTrees(n,edges)
print(res == output)

n = 6
edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]
output = [3,4]
res = Solution.findMinHeightTrees(n,edges)
print(res == output)
