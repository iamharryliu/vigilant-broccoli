from typing import List


class Solution:
    @classmethod
    def maxProfit(self, prices: List[int]) -> int:
        res = 0
        minPrice = float("inf")
        for price in prices:
            res = max(res, price - minPrice)
            minPrice = min(minPrice, price)
        return res
