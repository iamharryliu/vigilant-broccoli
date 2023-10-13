import heapq


class MedianFinder:
    def __init__(self):
        self.s = []
        self.l = []

    @property
    def is_small_value_greater_than_large_value(self):
        return self.s and self.l and -self.s[0] > self.l[0]

    @property
    def is_small_list_larger(self):
        return len(self.s) - len(self.l) > 1

    @property
    def is_large_list_larger(self):
        return len(self.l) - len(self.s) > 1

    def addNum(self, num: int) -> None:

        heapq.heappush(self.s, -num)
        while self.is_small_value_greater_than_large_value or self.is_small_list_larger:
            num = -heapq.heappop(self.s)
            heapq.heappush(self.l, num)
        if self.is_large_list_larger:
            num = -heapq.heappop(self.l)
            heapq.heappush(self.s, num)

    def findMedian(self) -> float:
        if len(self.s) > len(self.l):
            return -self.s[0]
        if len(self.l) > len(self.s):
            return self.l[0]
        snum = -self.s[0]
        lnum = self.l[0]
        return (snum + lnum) / 2


commands = ["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]
nums = [[], [1], [2], [], [3], []]
for i, command in enumerate(commands):
    if command == "MedianFinder":
        obj = MedianFinder()
    if command == "addNum":
        obj.addNum(nums[i][0])
    if command == "findMedian":
        print(obj.findMedian())
