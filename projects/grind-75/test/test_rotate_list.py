import unittest
from linked_list.common import LinkedList
from linked_list.rotate_list import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.rotateRight(LinkedList(head=[1, 2, 3, 4, 5]).head, k=2)
        expected = [4, 5, 1, 2, 3]
        self.assertEqual(LinkedList.to_list(res), expected)
        res = Solution.rotateRight(LinkedList(head=[0, 1, 2]).head, k=4)
        expected = [2, 0, 1]
        self.assertEqual(LinkedList.to_list(res), expected)
