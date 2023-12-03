import math
from typing import List


class Solution:
    @classmethod
    def maxProfit(self, prices: List[int]) -> int:
        """
        :type prices: List[int]
        :rtype: int
        """
        res = 0
        minPrice = math.inf
        for price in prices:
            res = max(res, price - minPrice)
            minPrice = min(minPrice, price)
        return res
