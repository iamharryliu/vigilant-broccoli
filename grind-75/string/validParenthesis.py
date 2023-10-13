class Solution:
    @classmethod
    def isValid(self, s):
        stack = []
        hmap = {"]": "[", "}": "{", ")": "("}
        for char in s:
            # Add opening brackets to stack
            if char in hmap.values():
                stack.append(char)
            # Check if closing bracket breaks rules
            elif char in hmap.keys():
                if stack == [] or hmap[char] != stack.pop():
                    return False
            else:
                return False
        return stack == []


test_value = "()[]{}"
result = Solution.isValid(test_value)
print(result)
