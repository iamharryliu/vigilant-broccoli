import unittest
from linked_list.common import LinkedList
from linked_list.linked_list_cycle import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.hasCycle(LinkedList(head=[3, 2, 0, -4], pos=1).head)
        excepted = True
        self.assertEqual(res, excepted)
        res = Solution.hasCycle(LinkedList(head=[1, 2], pos=0).head)
        excepted = True
        self.assertEqual(res, excepted)
        res = Solution.hasCycle(LinkedList(head=[1], pos=-1).head)
        excepted = False
        self.assertEqual(res, excepted)
