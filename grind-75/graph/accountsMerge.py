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


accounts = [
    ["John", "johnsmith@mail.com", "john_newyork@mail.com"],
    ["John", "johnsmith@mail.com", "john00@mail.com"],
    ["Mary", "mary@mail.com"],
    ["John", "johnnybravo@mail.com"],
]
output = [
    ["John", "john00@mail.com", "john_newyork@mail.com", "johnsmith@mail.com"],
    ["Mary", "mary@mail.com"],
    ["John", "johnnybravo@mail.com"],
]
res = Solution.accountsMerge(accounts)
print(res == output)


accounts = [
    ["Gabe", "Gabe0@m.co", "Gabe3@m.co", "Gabe1@m.co"],
    ["Kevin", "Kevin3@m.co", "Kevin5@m.co", "Kevin0@m.co"],
    ["Ethan", "Ethan5@m.co", "Ethan4@m.co", "Ethan0@m.co"],
    ["Hanzo", "Hanzo3@m.co", "Hanzo1@m.co", "Hanzo0@m.co"],
    ["Fern", "Fern5@m.co", "Fern1@m.co", "Fern0@m.co"],
]
output = [
    ["Ethan", "Ethan0@m.co", "Ethan4@m.co", "Ethan5@m.co"],
    ["Gabe", "Gabe0@m.co", "Gabe1@m.co", "Gabe3@m.co"],
    ["Hanzo", "Hanzo0@m.co", "Hanzo1@m.co", "Hanzo3@m.co"],
    ["Kevin", "Kevin0@m.co", "Kevin3@m.co", "Kevin5@m.co"],
    ["Fern", "Fern0@m.co", "Fern1@m.co", "Fern5@m.co"],
]
res = Solution.accountsMerge(accounts)
print(sorted(res) == sorted(output))
