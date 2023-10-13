class Solution:
    @classmethod
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1
            print(n)
            count += 1
        return count


testvalue = 1011
result = Solution.hammingWeight(testvalue)
print(result)
