from typing import Optional
from linked_list.common import ListNode


class Solution:
    @classmethod
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        if not head:
            return None

        # get length and tail of linked list
        length = 1
        tail = head
        while tail.next:
            tail = tail.next
            length += 1

        # if k is a multiple of the length of the linked list it will result in the same list
        k = k % length
        if k == 0:
            return head

        # move to last node and perform cut
        curr = head
        for _ in range(length - k - 1):
            curr = curr.next
        res = curr.next
        curr.next = None
        tail.next = head
        return res
