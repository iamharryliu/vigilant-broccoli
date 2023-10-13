class Solution:
    @classmethod
    def longestConsecutive(self, nums):
        setOfNums = set(nums)
        longestSequence = 0
        for num in setOfNums:
            if (num - 1) not in setOfNums:
                count = 0
                while num + count in setOfNums:
                    count += 1
                    longestSequence = max(count, longestSequence)
        return longestSequence


res = Solution.longestConsecutive([100, 4, 200, 1, 3, 2])
print(res)
