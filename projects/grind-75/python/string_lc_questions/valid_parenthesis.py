class Solution:
    @classmethod
    def isValid(self, s):
        hmap = {"]": "[", "}": "{", ")": "("}
        keys = hmap.keys()
        stack = []
        for c in s:
            if (c in keys and not stack) or (c in keys and hmap[c] != stack.pop()):
                return False
            if c in hmap.values():
                stack.append(c)

        return False if stack else True
