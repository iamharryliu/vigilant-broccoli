class Solution:
    @classmethod
    def countBits(self, num):
        # default value of 0 because there are no 1s in 0
        counter = [0]
        for i in range(1, num + 1):
            # get dp value of shifted number and check if there is a 1
            counter.append(counter[i >> 1] + i % 2)
        return counter


# 0000 | 0000 | 0 | 0 + dp[n-0]
# 0001 | 0001 | 1 | 1 + dp[n-1]
# 0002 | 0010 | 1 | 1 + dp[n-2]
# 0003 | 0011 | 2 | 1 + dp[n-2]
# 0004 | 0100 | 1 | 1 + dp[n-4]
# 0005 | 0101 | 2 | 1 + dp[n-4]
# 0006 | 0110 | 2 | 1 + dp[n-4]
# 0007 | 0111 | 3 | 1 + dp[n-4]
# 0008 | 1000 | 1 | 1 + dp[n-8]
