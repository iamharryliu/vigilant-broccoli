import math
from typing import List


class Solution:
    @classmethod
    def maxProfit(self, prices: List[int]) -> int:
        res = 0
        minPrice = math.inf
        for price in prices:
            res = max(res, price - minPrice)
            minPrice = min(minPrice, price)
        return res


print(Solution.maxProfit(prices=[7, 1, 5, 3, 6, 4]) == 5)
print(Solution.maxProfit(prices=[7, 6, 4, 3, 1]) == 0)
