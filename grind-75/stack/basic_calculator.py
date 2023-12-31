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
