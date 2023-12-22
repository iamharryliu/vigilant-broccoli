import heapq


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def mergeKLists(self, lists):
        heap = []
        for ll in lists:
            while ll:
                heapq.heappush(heap, ll.val)
                ll = ll.next

        root = ListNode(heapq.heappop(heap)) if heap else None
        curr = root
        while heap:
            val = heapq.heappop(heap)
            curr.next = ListNode(val)
            curr = curr.next

        return root
