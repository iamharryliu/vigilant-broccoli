from typing import List

from black import out


class Solution:
    @classmethod
    def generateParenthesis(self, n: int) -> List[str]:
        res = []

        def dfs(o, c, curr):
            if o == c == n:
                res.append(curr)
                return
            if o < n:
                dfs(o + 1, c, curr + "(")
            if c < o:
                dfs(o, c + 1, curr + ")")

        dfs(0, 0, "")
        return res


n = 3
output = ["((()))", "(()())", "(())()", "()(())", "()()()"]
res = Solution.generateParenthesis(n)
print(res == output)

n = 1
output = ["()"]
res = Solution.generateParenthesis(n)
print(res == output)
