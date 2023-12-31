class Solution:
    @classmethod
    def climbStairs(self, n):
        """
        :type n: int
        :rtype: int
        """
        n1 = 1
        n2 = 1
        for _ in range(n - 1):
            tmp = n2
            n2 = n1 + n2
            n1 = tmp
        return n2
