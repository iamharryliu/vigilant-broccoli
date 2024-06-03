from typing import List


class Solution:
    @classmethod
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        res = [0] * len(temperatures)
        stack = []

        for i, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < t:
                pi = stack.pop()
                res[pi] = i - pi
            stack.append(i)
        return res


temperatures = [73, 74, 75, 71, 69, 72, 76, 73]
output = [1, 1, 4, 2, 1, 1, 0, 0]
res = Solution.dailyTemperatures(temperatures)
print(res == output)

temperatures = [30, 40, 50, 60]
output = [1, 1, 1, 0]
res = Solution.dailyTemperatures(temperatures)
print(res == output)
