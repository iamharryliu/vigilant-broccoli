from collections import Counter
import heapq
from typing import Deque, List


class Solution:
    @classmethod
    def leastInterval(self, tasks: List[str], n: int) -> int:
        heap = [-task for task in Counter(tasks).values()]
        heapq.heapify(heap)
        q = Deque()
        time = 0
        while heap or q:
            time += 1
            if heap:
                task = heapq.heappop(heap) + 1
                if task:
                    q.append([task, time + n])
            if q and q[0][1] == time:
                heapq.heappush(heap, q.popleft()[0])
        return time
