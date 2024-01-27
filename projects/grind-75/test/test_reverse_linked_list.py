import unittest
from linked_list.common import LinkedList
from linked_list.reverse_linked_list import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.reverseList(LinkedList([1, 2, 3, 4, 5]).head)
        res = LinkedList.to_list(res)
        expected = [5, 4, 3, 2, 1]
        self.assertEqual(res, expected)
        res = Solution.reverseList(LinkedList([1, 2]).head)
        res = LinkedList.to_list(res)
        expected = [2, 1]
        self.assertEqual(res, expected)
