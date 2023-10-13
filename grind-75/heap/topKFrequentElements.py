import heapq


class Solution:
    @classmethod
    def topKFrequent(self, nums, k):

        # put numbers into hashmap
        hashmap = {}
        for num in nums:
            hashmap[num] = hashmap.get(num, 0) + 1

        # turn hashmap into max heap
        heap = []
        for key, value in hashmap.items():
            heapq.heappush(heap, [-value, key])

        # pop values from max heap into result
        result = []
        for i in range(k):
            result.append(heapq.heappop(heap)[1])
        return result


res = Solution.topKFrequent([1,1,1,2,2,3], 2)
print(res)