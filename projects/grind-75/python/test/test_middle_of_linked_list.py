import unittest
from linked_list.common import LinkedList
from linked_list.middle_of_the_linked_list import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.middleNode(LinkedList(head=[1, 2, 3, 4, 5]).head)
        self.assertEqual(LinkedList.to_list(res), [3, 4, 5])
        res = Solution.middleNode(LinkedList(head=[1, 2, 3, 4, 5, 6]).head)
        self.assertEqual(LinkedList.to_list(res), [4, 5, 6])
