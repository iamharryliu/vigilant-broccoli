from typing import Optional
from linked_list.common import ListNode


class Solution:
    @classmethod
    def reorderList(self, head: Optional[ListNode]) -> None:
        """
        Do not return anything, modify head in-place instead.
        """

        slow = head
        fast = head.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        prev = None
        curr = slow.next
        while curr:
            tmp = curr.next
            curr.next = prev
            prev = curr
            curr = tmp

        slow.next = None

        l1 = head
        l2 = prev
        while l2:
            next_l2 = l1.next
            l1.next = l2
            l1 = l2
            l2 = next_l2
