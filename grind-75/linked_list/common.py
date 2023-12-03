# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class LinkedList:
    def __init__(self, nums=[]):
        self.head = None
        if nums:
            self.append_numbers(nums)

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
