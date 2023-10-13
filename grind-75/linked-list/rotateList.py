# Definition for singly-linked list.
from typing import Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        if not head:
            return None

        length = 1
        tail = head
        while tail.next:
            tail = tail.next
            length += 1

        # rotating by k will result in same list
        k = k % length
        if k == 0:
            return head

        # move to last node and perform cut
        curr = head
        for _ in range(length - k - 1):
            curr = curr.next
        nhead = curr.next
        curr.next = None
        tail.next = head
        return nhead
