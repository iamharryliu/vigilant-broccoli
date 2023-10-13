class Solution:
    @classmethod
    def calculate(self, s: str) -> int:
        stack = [1, 1]
        res = 0
        i = 0
        while i < len(s):
            if s[i].isdigit():
                curr = ""
                while i < len(s) and s[i].isdigit():
                    curr += s[i]
                    i += 1
                res += stack.pop() * int(curr)
            else:
                if s[i] in "+(":
                    stack.append(stack[-1])
                if s[i] == "-":
                    stack.append(-stack[-1])
                if s[i] == ")":
                    stack.pop()
                i += 1
        return res


s = "1 + 1"
output = 2
res = Solution.calculate(s)
print(res == output)


s = " 2-1 + 2 "
output = 3
res = Solution.calculate(s)
print(res == output)


s = "(1+(4+5+2)-3)+(6+8)"
output = 23
res = Solution.calculate(s)
print(res == output)
