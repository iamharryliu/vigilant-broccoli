import unittest
from linked_list.common import LinkedList
from linked_list.reorder_list import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        ll = LinkedList(head=[1, 2, 3, 4]).head
        Solution.reorderList(ll)
        res = LinkedList.to_list(ll)
        expected = [1, 4, 2, 3]
        self.assertEqual(res, expected)
        ll = LinkedList(head=[1, 2, 3, 4, 5]).head
        Solution.reorderList(ll)
        res = LinkedList.to_list(ll)
        expected = [1, 5, 2, 4, 3]
        self.assertEqual(res, expected)
