class Solution:
    @classmethod
    def isValid(self, s):
        stack = []
        hmap = {"]": "[", "}": "{", ")": "("}
        for char in s:
            # Is open bracket.
            if char in hmap.values():
                stack.append(char)

            # Is closing bracket.
            elif char in hmap.keys():
                if not stack or hmap[char] != stack.pop():
                    return False

            # Is neither.
            else:
                return False
        return not stack
