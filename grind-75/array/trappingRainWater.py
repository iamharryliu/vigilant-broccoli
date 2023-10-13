from typing import List


class Solution:
    @classmethod
    def trap(self, height: List[int]) -> int:
        l = 0
        r = len(height) - 1
        lmax = height[l]
        rmax = height[r]
        res = 0

        while l < r:
            if lmax < rmax:
                l += 1
                lmax = max(lmax, height[l])
                res += lmax - height[l]
            else:
                r -= 1
                rmax = max(rmax, height[r])
                res += rmax - height[r]

        return res


height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
output = 6
res = Solution.trap(height)
print(res == output)

height = [4, 2, 0, 3, 2, 5]
output = 9
res = Solution.trap(height)
print(res == output)
