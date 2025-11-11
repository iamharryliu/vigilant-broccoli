class Solution:
    @classmethod
    def isValid(self, s):
        hmap = {")": "(", "}": "{", "]": "["}
        stack = []
        for c in s:
            if c in hmap:
                if not stack or stack.pop() != hmap[c]:
                    return False
            else:
                stack.append(c)
        return not stack
