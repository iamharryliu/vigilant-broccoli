class Solution:
    @classmethod
    def calculate(self, s: str) -> int:
        stack = [1, 1]
        res = 0
        i = 0
        while i < len(s):
            if s[i].isdigit():
                num = 0
                while i < len(s) and s[i].isdigit():
                    num = num * 10 + int(s[i])
                    i += 1
                res += stack.pop() * num
            else:
                if s[i] in "+(":
                    stack.append(stack[-1])
                if s[i] == "-":
                    stack.append(-stack[-1])
                if s[i] == ")":
                    stack.pop()
                i += 1
        return res
