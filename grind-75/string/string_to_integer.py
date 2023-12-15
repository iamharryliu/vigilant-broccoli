class Solution:
    @classmethod
    def myAtoi(self, s: str) -> int:
        if len(s) == 0:
            return 0

        res = 0
        state = 0
        sign = 1

        for c in s:
            if state == 0:
                if c == " ":
                    state = 0
                elif c == "+" or c == "-":
                    state = 1
                    sign = 1 if c == "+" else -1
                elif c.isdigit():
                    state = 2
                    res = res * 10 + int(c)
                else:
                    return 0
            elif state == 1:
                if c.isdigit():
                    state = 2
                    res = res * 10 + int(c)
                else:
                    return 0
            elif state == 2:
                if c.isdigit():
                    state = 2
                    res = res * 10 + int(c)
                else:
                    break
            else:
                return 0

        res = sign * res
        res = min(res, 2**31 - 1)
        res = max(-(2**31), res)
        return res
