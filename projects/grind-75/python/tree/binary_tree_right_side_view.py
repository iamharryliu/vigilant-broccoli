from collections import deque
from typing import List, Optional
from tree.common import TreeNode


class Solution:
    @classmethod
    def rightSideViewDfs(self, root: Optional[TreeNode]) -> List[int]:
        res = []

        def dfs(node=root, i=0):
            if not node:
                return
            if i == len(res):
                res.append(node.val)
            dfs(node.right, i + 1)
            dfs(node.left, i + 1)

        dfs()
        return res

    @classmethod
    def rightSideViewBfs(self, root: Optional[TreeNode]) -> List[int]:
        res = []
        if not root:
            return res
        q = deque([root])
        while q:
            res.append(q[-1].val)
            for i in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
        return res
