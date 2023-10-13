from typing import Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        def get_kth_node(node):
            for _ in range(k):
                node = node.next
                if not node:
                    return None
            return node

        dummy = ListNode(0, head)
        prev_group = dummy

        while True:
            kth_node = get_kth_node(prev_group)
            if not kth_node:
                break
            next_group = kth_node.next
            prev, curr = kth_node.next, prev_group.next

            while curr != next_group:
                nxt = curr.next
                curr.next = prev
                prev = curr
                curr = nxt
            prev_group.next, prev_group = kth_node, prev_group.next

        return dummy.next
