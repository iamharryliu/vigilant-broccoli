# Definition for a binary tree node.
from collections import deque
from typing import List, Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def zigzagLevelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        reverse = False
        q = deque([root])
        res = []
        while q:
            layer = []
            for _ in range(len(q)):
                node = q.popleft()
                if node:
                    layer.append(node.val)
                    q.append(node.left)
                    q.append(node.right)

            if layer:
                res.append(layer if not reverse else layer[::-1])
            reverse = not reverse
        return res
