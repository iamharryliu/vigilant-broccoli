from typing import Optional
from common import ListNode


class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        prev, curr = dummy, head

        while curr and curr.next:
            second = curr.next
            third = curr.next.next

            second.next = curr
            curr.next = third
            prev.next = second

            prev = curr
            curr = third
        return dummy.next
