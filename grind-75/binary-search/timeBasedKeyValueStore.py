from collections import defaultdict


class TimeMap:
    def __init__(self):
        self.hmap = defaultdict(list)

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.hmap[key].append([value, timestamp])

    def get(self, key: str, timestamp: int) -> str:
        res = ""
        values = self.hmap[key]
        l = 0
        r = len(values) - 1
        while l <= r:
            m = (l + r) // 2
            t = values[m][1]
            if t == timestamp:
                return values[m][0]
            if t < timestamp:
                l = m + 1
                res = values[m][0]
            if t > timestamp:
                r = m - 1
        return res


# Your TimeMap object will be instantiated and called as such:
# obj = TimeMap()
# obj.set(key,value,timestamp)
# param_2 = obj.get(key,timestamp)
