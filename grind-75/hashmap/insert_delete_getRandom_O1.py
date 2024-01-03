import random


class RandomizedSet:
    def __init__(self):
        self.hmap = {}
        self.data = []

    def insert(self, val: int) -> bool:
        if val in self.hmap:
            return False
        self.hmap[val] = len(self.data)
        self.data.append(val)

        return True

    def remove(self, val: int) -> bool:
        if not val in self.hmap:
            return False
        last_data = self.data[-1]
        index_to_remove = self.hmap[val]

        self.hmap[last_data] = index_to_remove
        self.data[index_to_remove] = last_data

        self.hmap.pop(val)
        self.data.pop()

        return True

    def getRandom(self) -> int:
        return random.choice(self.data)
