class Solution:
    @classmethod
    def isAnagram(self, s, t):
        for c in set(s + t):
            if s.count(c) != t.count(c):
                return False
        return True

        # Hashmap
        # dic1, dic2 = {}, {}
        # # loop through strings and increment counter for characters
        # for item in s:
        #     dic1[item] = dic1.get(item, 0) + 1
        # for item in t:
        #     dic2[item] = dic2.get(item, 0) + 1
        # # check that dics are the same
        # return dic1 == dic2


s = "anagram"
t = "nagaram"

print(Solution.isAnagram(s, t))
