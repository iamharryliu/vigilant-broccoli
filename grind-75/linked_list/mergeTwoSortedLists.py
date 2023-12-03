from common import ListNode


class Solution:
    @classmethod
    def mergeTwoLists(self, l1, l2):
        dummy = curr = ListNode(0)
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


node1 = ListNode(1)
node2 = ListNode(2)
node3 = ListNode(3)
node4 = ListNode(4)
node5 = ListNode(5)
node6 = ListNode(6)
node7 = ListNode(7)

node5.next = node7
node3.next = node5
node1.next = node3
ll1 = node1

node4.next = node6
node2.next = node4
ll2 = node2

newll = Solution.mergeTwoLists(ll1, ll2)
while newll:
    print(newll.val)
    newll = newll.next
