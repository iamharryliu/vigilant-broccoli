class Solution:
    @classmethod
    def reverseList(self, head):
        prev = None

        while head:
            current = head
            head = head.next
            current.next = prev
            prev = current

        # while head:
        #     nxt = head.next
        #     head.next = prev
        #     prev = head
        #     head = nxt

        return prev
