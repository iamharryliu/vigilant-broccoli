import unittest
from heap.merge_k_sorted_lists import Solution
from linked_list.common import LinkedList


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.mergeKLists(
            lists=[
                LinkedList([1, 4, 5]).head,
                LinkedList([1, 3, 4]).head,
                LinkedList([2, 6]).head,
            ]
        )
        res = LinkedList.to_list(res)
        expected = [1, 1, 2, 3, 4, 4, 5, 6]
        self.assertEqual(res, expected)
        res = Solution.mergeKLists(lists=[])
        expected = []
        self.assertEqual(res, expected)
        res = Solution.mergeKLists(lists=[LinkedList([]).head])
        expected = []
        self.assertEqual(res, expected)
