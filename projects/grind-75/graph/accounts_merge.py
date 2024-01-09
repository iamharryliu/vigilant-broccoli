from collections import defaultdict
from typing import List


class Solution(object):
    @classmethod
    def accountsMerge(self, accounts: List[List[str]]) -> List[List[str]]:
        graph = defaultdict(list)
        for i, account in enumerate(accounts):
            for email in account[1:]:
                graph[email].append(i)

        def get_emails(i, emails):
            if i not in visited:
                visited.add(i)
                account = accounts[i]
                for email in account[1:]:
                    emails.add(email)
                    for j in graph[email]:
                        get_emails(j, emails)
            return emails

        res = []
        visited = set()
        for i, account in enumerate(accounts):
            emails = get_emails(i, set())

            if emails:
                res.append([account[0]] + sorted(list(emails)))
        return res
