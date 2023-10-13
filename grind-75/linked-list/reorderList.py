# Definition for singly-linked list.
from typing import Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


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


node1 = ListNode(1)
node2 = ListNode(2)
node3 = ListNode(3)
node4 = ListNode(4)
node5 = ListNode(5)
node4.next = node5
node3.next = node4
node2.next = node3
node1.next = node2

Solution.reorderList(node1)
while node1:
    print(node1.val)
    node1 = node1.next
