from collections import defaultdict
from typing import List


class Solution:
    @classmethod
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
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


beginWord = "hit"
endWord = "cog"
wordList = ["hot", "dot", "dog", "lot", "log", "cog"]
output = 5
res = Solution.ladderLength(beginWord, endWord, wordList)
print(res == output)

beginWord = "hit"
endWord = "cog"
wordList = ["hot", "dot", "dog", "lot", "log"]
output = 0
res = Solution.ladderLength(beginWord, endWord, wordList)
print(res == output)
