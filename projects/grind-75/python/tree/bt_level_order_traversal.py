from collections import deque


class Solution:
    @classmethod
    def levelOrder(self, root):

        if not root:
            return []

        res = []
        q = deque([root])

        while q:
            res.append([node.val for node in q])
            for _ in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)

        return res
