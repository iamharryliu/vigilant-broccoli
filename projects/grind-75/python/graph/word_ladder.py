from collections import defaultdict, deque
from typing import List


# TODO: Bi-directional BFS?
class Solution:
    @classmethod
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        if endWord not in wordList:
            return 0

        graph = defaultdict(list)
        for word in wordList + [beginWord]:
            for i in range(len(word)):
                graph[word[0:i] + "*" + word[i + 1 :]].append(word)

        q = deque([beginWord])
        visited = set()
        res = 0
        while q:
            res += 1
            for _ in range(len(q)):
                word = q.popleft()
                if word == endWord:
                    return res
                for i in range(len(word)):
                    key = word[0:i] + "*" + word[i + 1 :]
                    if key not in visited:
                        q += graph[key]
                        visited.add(key)
        return 0
