# Definition for singly-linked list.
class ListNode:
    def __init__(self, x):
        self.val = x
        self.next = None


class Solution:
    @classmethod
    def hasCycle(self, head) -> bool:
        if not head or not head.next:
            return False
        slow = head
        fast = head.next
        while slow is not fast:
            if not fast.next or not fast.next.next:
                return False
            slow = slow.next
            fast = fast.next.next
        return True

        # Alternate solution
        # if not head or not head.next:
        #     return False

        # slow = head
        # fast = head.next
        # while fast and fast.next:
        #     if slow == fast:
        #         return True
        #     slow = slow.next
        #     fast = fast.next.next

        # return False


node1 = ListNode(1)
node2 = ListNode(2)
node3 = ListNode(3)
node4 = ListNode(4)
node4.next = node1
node3.next = node4
node2.next = node3
node1.next = node2
print(Solution.hasCycle(node1))
node1.next.next.next = None
print(Solution.hasCycle(node1))
