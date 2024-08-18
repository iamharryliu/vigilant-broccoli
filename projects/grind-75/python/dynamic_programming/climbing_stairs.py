class Solution:
    @classmethod
    def climbStairs(self, n):
        if n == 1:
            return 1
        n_minus_2 = 1
        n_minus_1 = 2
        for _ in range(3, n + 1):
            tmp = n_minus_1
            n_minus_1 = n_minus_2 + n_minus_1
            n_minus_2 = tmp
        return n_minus_1
