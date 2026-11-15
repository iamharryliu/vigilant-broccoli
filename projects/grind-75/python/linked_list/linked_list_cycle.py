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
