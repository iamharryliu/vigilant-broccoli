import math
from typing import List


class Solution:
    @classmethod
    def maxProfit(self, prices: List[int]) -> int:
        minPrice = math.inf
        profit = 0
        for price in prices:
            profit = max(profit, price - minPrice)
            minPrice = min(minPrice, price)
        return profit


print(Solution.maxProfit(prices=[7, 1, 5, 3, 6, 4]) == 5)
print(Solution.maxProfit(prices=[7, 6, 4, 3, 1]) == 0)
