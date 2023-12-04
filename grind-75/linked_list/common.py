# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class LinkedList:
    def __init__(self, head=[], pos=-1):
        self.head = None
        if head:
            self.append_numbers(head)
        if pos >= 0:
            curr = self.head
            pos_node = None
            i = 0
            while curr.next:
                if i == pos:
                    pos_node = curr
                i += 1
                curr = curr.next
            curr.next = pos_node

    def append(self, data):
        new_node = ListNode(data)
        if not self.head:
            self.head = new_node
            return
        last_node = self.head
        while last_node.next:
            last_node = last_node.next
        last_node.next = new_node

    def append_numbers(self, nums):
        for num in nums:
            self.append(num)

    @classmethod
    def to_list(self, head):
        res = []
        curr = head
        while curr:
            res.append(curr.val)
            curr = curr.next
        return res
