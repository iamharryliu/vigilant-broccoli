class Solution:
    @classmethod
    def containsDuplicate(self, nums) -> bool:
        return len(set(nums)) != len(nums)


x = [1, 2, 3, 4, 5, 6, 7]
y = [1, 2, 3, 4, 5, 6, 6]

print(Solution.containsDuplicate(x))
print(Solution.containsDuplicate(y))
