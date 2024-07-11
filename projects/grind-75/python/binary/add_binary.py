class Solution(object):
    @classmethod
    def addBinary(self, a, b):
        """
        :type a: str
        :type b: str
        :rtype: str
        """
        res = ""
        carry = 0
        while a or b:
            n1 = int(a[-1]) if a else 0
            n2 = int(b[-1]) if b else 0
            if n1 and n2:
                s = 1 if carry else 0
                ncarry = 1
            elif n1 or n2:
                s = 0 if carry else 1
                ncarry = 1 if carry else 0
            elif not n1 and not n2:
                s = 1 if carry else 0
                ncarry = 0
            res = str(s) + res
            carry = ncarry
            a = a[0:-1]
            b = b[0:-1]
        if carry:
            res = str(carry) + res
        return res
