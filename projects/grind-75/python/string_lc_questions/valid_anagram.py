class Solution:
    @classmethod
    def isAnagram(self, s, t):
        if len(s) != len(t):
            return False
        count_s, count_t = {}, {}
        for item in s:
            count_s[item] = count_s.get(item, 0) + 1
        for item in t:
            count_t[item] = count_t.get(item, 0) + 1
        return count_s == count_t
