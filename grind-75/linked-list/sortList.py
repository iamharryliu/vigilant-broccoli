# Definition for singly-linked list.
from typing import Optional


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        def getMid(head):
            slow = head
            fast = head.next
            while fast and fast.next:
                slow = slow.next
                fast = fast.next.next
            return slow

        def merge(l1, l2):
            curr = dummy = ListNode()
            while l1 and l2:
                if l1.val < l2.val:
                    curr.next = l1
                    l1 = l1.next
                else:
                    curr.next = l2
                    l2 = l2.next
                curr = curr.next
            curr.next = l1 or l2
            return dummy.next

        if not head or not head.next:
            return head

        left = head
        left_side_end_node = getMid(head)
        right = left_side_end_node.next
        left_side_end_node.next = None
        left = self.sortList(left)
        right = self.sortList(right)
        return merge(left, right)
