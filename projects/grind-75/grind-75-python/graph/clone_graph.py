from typing import Optional
from graph.common import Node


class Solution:
    @classmethod
    def cloneGraph(self, node: Optional[Node]) -> Optional[Node]:
        hmap = {}

        def dfs(node):
            if node in hmap:
                return hmap[node]
            copy = Node(node.val)
            hmap[node] = copy
            for neighbor in node.neighbors:
                copy.neighbors.append(dfs(neighbor))
            return copy

        return dfs(node) if node else None


"""
Time Complexity - O(V+E)
Space Complexity - O(V)
"""
