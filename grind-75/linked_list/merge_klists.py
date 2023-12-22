from common import ListNode
import heapq


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
