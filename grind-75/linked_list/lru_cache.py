class Node:
    def __init__(self, key, val):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.hmap = {}
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def insert(self, node):
        prv = self.tail.prev
        nxt = self.tail
        prv.next, nxt.prev = node, node
        node.prev, node.next = prv, nxt

    def remove(self, node):
        prev = node.prev
        nxt = node.next
        prev.next = nxt
        nxt.prev = prev

    def get(self, key: int) -> int:
        if key in self.hmap:
            node = self.hmap[key]
            self.remove(node)
            self.insert(node)
            return node.val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.hmap:
            node = self.hmap[key]
            self.remove(node)
        node = Node(key, value)
        self.hmap[key] = node
        self.insert(node)

        if len(self.hmap) > self.capacity:
            node = self.head.next
            self.remove(node)
            del self.hmap[node.key]
