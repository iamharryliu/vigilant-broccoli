from typing import List


class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        stack = []
        for c in tokens:
            if c in "+-*/":
                a = stack.pop()
                b = stack.pop()
                if c == "+":
                    stack.append(a + b)
                if c == "-":
                    stack.append(b - a)
                if c == "/":
                    stack.append(int(b / a))
                if c == "*":
                    stack.append(a * b)
            else:
                stack.append(int(c))
        return stack.pop()
