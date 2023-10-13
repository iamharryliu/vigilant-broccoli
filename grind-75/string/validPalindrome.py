class Solution:
    @classmethod
    def isPalindrome(self, s: str) -> bool:
        left, right = 0, len(s) - 1
        while left < right:
            # skip indice if value is not alphanumeric
            while left < right and not s[left].isalnum():
                left += 1
            while left < right and not s[right].isalnum():
                right -= 1
            # check if lowercase values are the same
            if s[left].lower() != s[right].lower():
                return False
            # advance pointers
            left += 1
            right -= 1
        return True


test_value = "A man, a plan, a canal: Panama"
result = Solution.isPalindrome(test_value)
print(result)
