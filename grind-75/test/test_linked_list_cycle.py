import unittest
from linked_list.common import LinkedList
from linked_list.linked_list_cycle import Solution


class TestStringMethods(unittest.TestCase):
    def test(self):
        res = Solution.hasCycle(LinkedList(head=[3, 2, 0, -4], pos=1).head)
        self.assertEqual(res, True)
        res = Solution.hasCycle(LinkedList(head=[1, 2], pos=0).head)
        self.assertEqual(res, True)
        res = Solution.hasCycle(LinkedList(head=[1], pos=-1).head)
        self.assertEqual(res, False)


if __name__ == "__main__":
    unittest.main()
