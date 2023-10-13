class Solution:
    @classmethod
    def characterReplacement(self, s, k):
        charCount = {}
        maxLength = leftIndex = 0

        for rightIndex in range(len(s)):
            charCount[s[rightIndex]] = 1 + charCount.get(s[rightIndex], 0)

            windowLength = rightIndex - leftIndex + 1
            invalidWindow = windowLength - max(charCount.values()) > k
            if invalidWindow:
                charCount[s[leftIndex]] -= 1
                leftIndex += 1

            maxLength = max(maxLength, rightIndex - leftIndex + 1)
        return maxLength


result = Solution.characterReplacement("ABAB", 2)
print(result)
