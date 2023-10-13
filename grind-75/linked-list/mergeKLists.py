import heapq

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def mergeKLists(self, lists):
        heap = []
        for l in lists:
            while l:
                heapq.heappush(heap, l.val)
                l = l.next
        dummy = ListNode()
        curr = dummy
        for _ in range(len(heap)):
            curr.next = ListNode(heapq.heappop(heap))
            curr = curr.next
        return dummy.next
