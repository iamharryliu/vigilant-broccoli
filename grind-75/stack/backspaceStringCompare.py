class Solution:
    @classmethod
    def backspaceCompare(self, s: str, t: str) -> bool:
        sstack = []
        for c in s:
            if c == "#":
                if sstack:
                    sstack.pop()
            else:
                sstack.append(c)
        tstack = []
        for c in t:
            if c == "#":
                if tstack:
                    tstack.pop()
            else:
                tstack.append(c)
        return sstack == tstack


s = "ab#c"
t = "ad#c"
output = True
res = Solution.backspaceCompare(s, t)
print(res is output)
s = "ab##"
t = "c#d#"
output = True
res = Solution.backspaceCompare(s, t)
print(res is output)
s = "a#c"
t = "b"
output = False
res = Solution.backspaceCompare(s, t)
print(res is output)
