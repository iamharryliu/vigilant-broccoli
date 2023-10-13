# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    @classmethod
    def removeNthFromEnd(self, head, n):
        slow = fast = head
        for _ in range(n):
            fast = fast.next
        # edge case to remove the first node of the LL
        if not fast:
            return head.next
        while fast.next:
            fast = fast.next
            slow = slow.next
        slow.next = slow.next.next
        return head

        # non-optimal answer that requires counting the LL then cutting off the node
        curr = head
        length = 1
        while curr and curr.next:
            length += 1
            curr = curr.next

        if length == n:
            return head.next

        if length == 1:
            return None

        curr = head
        for _ in range(length - n - 1):
            curr = curr.next

        curr.next = curr.next.next
        return head


node1 = ListNode(1)
node2 = ListNode(2)
node3 = ListNode(3)
node4 = ListNode(4)
node5 = ListNode(5)
node4.next = node5
node3.next = node4
node2.next = node3
node1.next = node2
head = node1

result = Solution.removeNthFromEnd(head, 2)
while result:
    print(result.val)
    result = result.next
