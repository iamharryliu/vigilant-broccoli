class Solution:
    @classmethod
    def calculate(self, s: str) -> int:
        stack = [1]
        res = 0
        i = 0
        sign = 1
        while i < len(s):
            if s[i].isdigit():
                num = 0
                while i < len(s) and s[i].isdigit():
                    num = num * 10 + int(s[i])
                    i += 1
                res += sign * num
                continue
            elif s[i] == "+":
                sign = stack[-1]
            elif s[i] == "-":
                sign = -stack[-1]
            elif s[i] == "(":
                stack.append(sign)
            elif s[i] == ")":
                stack.pop()
            i += 1

        return res
