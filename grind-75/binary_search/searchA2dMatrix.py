from typing import List


class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        t = 0
        b = len(matrix) - 1
        while t <= b:
            m = (t + b) // 2
            if target < matrix[m][0]:
                b -= 1
            elif matrix[m][-1] < target:
                t += 1
            else:
                break
        if t > b:
            return False
        row = matrix[m]
        l = 0
        r = len(row)
        while l <= r:
            m = (l + r) // 2
            if target < row[m]:
                r = m - 1
            elif target > row[m]:
                l = m + 1
            else:
                return True
        return False
