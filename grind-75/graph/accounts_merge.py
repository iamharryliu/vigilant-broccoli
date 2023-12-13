from collections import defaultdict
from typing import List


class Solution(object):
    @classmethod
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        graph = defaultdict(list)
        for i, account in enumerate(accounts):
            for email in account[1:]:
                graph[email].append(i)

        def dfs(i, arr):
            if i not in visited:
                visited.add(i)
                for j in range(len(accounts[i][1:])):
                    email = accounts[i][j + 1]
                    arr.add(email)
                    for k in graph[email]:
                        dfs(k, arr)
            return arr

        res = []
        visited = set()
        for i, account in enumerate(accounts):
            if i not in visited:
                res.append([account[0]] + sorted(list(dfs(i, set()))))
        return res
