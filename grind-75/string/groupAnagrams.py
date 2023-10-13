from typing import DefaultDict


class Solution:
    @classmethod
    def groupAnagrams(self, strs):
        d = {}
        for string in strs:
            # Create hash key using character counts to store string
            key = tuple(sorted(string))
            d[key] = d.get(key, []) + [string]
        # return hashmap values
        return d.values()


result = Solution.groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
print(result)
