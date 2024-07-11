import math


class Solution:
    @classmethod
    def calculate(self, s: str) -> int:
        num = 0
        prev_sign = "+"
        stack = []
        for c in s + "+":
            if c.isdigit():
                num = num * 10 + int(c)
            if c in "+-*/":
                if prev_sign == "+":
                    stack.append(num)
                elif prev_sign == "-":
                    stack.append(-num)
                elif prev_sign == "*":
                    stack.append(stack.pop() * num)
                elif prev_sign == "/":
                    stack.append(stack.pop() // num)
                prev_sign = c
                num = 0
        return sum(stack)
