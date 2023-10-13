class Solution:
    @classmethod
    def numDecodings(self, s: str) -> int:
        dp = {len(s): 1}  # last character will provide at least 1 answer

        def dfs(i):

            # base cases
            if i in dp:
                return dp[i]
            if s[i] == 0:
                return 0

            res = dfs(i + 1)

            # dfs i + 2 if value is between 10-26
            if i + 1 < len(s) and (s[i] == "1" or s[i] == "2") and s[i + 1] in "123456":
                res += dfs(i + 2)
            print(i, res)
            dp[i] = res

            return res

        return dfs(0)


result = Solution.numDecodings("12")
expected = 2
print(result == expected)

result = Solution.numDecodings("226")
expected = 3
print(result == expected)


result = Solution.numDecodings("06")
expected = 1
print(result == expected)
