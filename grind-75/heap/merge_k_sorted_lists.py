import heapq
from linked_list.common import ListNode


class Solution:
    @classmethod
    def mergeKLists(self, lists):
        heap = []
        for ll in lists:
            while ll:
                heapq.heappush(heap, ll.val)
                ll = ll.next

        root = ListNode(heapq.heappop(heap)) if heap else []
        curr = root
        while heap:
            val = heapq.heappop(heap)
            curr.next = ListNode(val)
            curr = curr.next

        return root
