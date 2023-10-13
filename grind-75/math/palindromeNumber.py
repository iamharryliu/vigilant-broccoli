class Solution:
    def isPalindrome(self, x: int) -> bool:
        # reverse x and compare
        if x < 0:
            return False

        prev = x
        rev = 0
        while prev > 0:
            rev = rev * 10 + prev % 10
            prev = prev // 10
        return rev == x

        # convert to string solution
        return str(x) == str(x)[::-1]
