from typing import List


class Solution:
    @classmethod
    def longestCommonPrefix(self, strs: List[str]) -> str:
        res = ""
        for _, c in enumerate(strs[0]):
            prefix = res + c
            for w in strs:
                if not w.startswith(prefix):
                    return res
            res = prefix
        return res


strs = ["flower", "flow", "flight"]
output = "fl"
res = Solution.longestCommonPrefix(strs)
print(res == output)

strs = ["dog", "racecar", "car"]
output = ""
res = Solution.longestCommonPrefix(strs)
print(res == output)
