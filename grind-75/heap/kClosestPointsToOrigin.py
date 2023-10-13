from typing import List
import heapq


class Solution:
    @classmethod
    def kClosest(self, points: List[List[int]], k: int) -> List[List[int]]:
        heap = []
        for x, y in points:
            heapq.heappush(heap, (x**2 + y**2, [x, y]))
        return [heapq.heappop(heap)[1] for _ in range(k)]


points = [[1, 3], [-2, 2]]
k = 1
output = [[-2, 2]]
res = Solution.kClosest(points, k)
print(res == output)

points = [[3, 3], [5, -1], [-2, 4]]
k = 2
output = [[3, 3], [-2, 4]]
res = Solution.kClosest(points, k)
print(res == output)
