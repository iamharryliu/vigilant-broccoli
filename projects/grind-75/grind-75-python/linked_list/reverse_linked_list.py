class Solution:
    @classmethod
    def reverseList(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
        # using curr
        prev = None
        while head:
            current = head
            head = head.next
            current.next = prev
            prev = current
        return prev
        # using nxt
        # prev = None
        # while head:
        #     nxt = head.next
        #     head.next = prev
        #     prev = head
        #     head = nxt
        # return prev
