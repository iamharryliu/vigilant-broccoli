class Solution:
    @classmethod
    def romanToInt(self, s: str) -> int:
        mapping = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        res = 0
        s = s.replace("IV", "IIII").replace("IX", "VIIII")
        s = s.replace("XL", "XXXX").replace("XC", "LXXXX")
        s = s.replace("CD", "CCCC").replace("CM", "DCCCC")
        for c in s:
            res += mapping[c]
        return res


s = "III"
output = 3
res = Solution.romanToInt(s)
print(res == output)

s = "LVIII"
output = 58
res = Solution.romanToInt(s)
print(res == output)

s = "MCMXCIV"
output = 1994
res = Solution.romanToInt(s)
print(res == output)
