class Solution:
    @classmethod
    def longestPalindrome(self, s: str) -> int:
        s_count = {}
        for c in s:
            s_count[c] = s_count.get(c, 0) + 1
        res = 0
        has_odd_amount_of_characters = False
        for count in s_count.values():
            if count % 2 == 1:
                has_odd_amount_of_characters = True
                res += count - 1
            else:
                res += count
        return res + 1 if has_odd_amount_of_characters else res
