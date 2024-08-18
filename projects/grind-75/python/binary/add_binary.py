class Solution(object):
    @classmethod
    def addBinary(self, a: str, b: str) -> str:
        res = ""
        carry = 0
        i = len(a) - 1
        j = len(b) - 1

        while i >= 0 or j >= 0 or carry > 0:
            n1 = int(a[i]) if i >= 0 else 0
            n2 = int(b[j]) if j >= 0 else 0

            total = n1 + n2 + carry
            carry = total // 2
            res = f"{total % 2}" + res

            i -= 1
            j -= 1

        return res
