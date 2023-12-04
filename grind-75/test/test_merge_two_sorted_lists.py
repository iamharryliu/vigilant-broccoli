import unittest
from linked_list.common import LinkedList
from linked_list.merge_two_sorted_lists import Solution


class TestStringMethods(unittest.TestCase):
    def test(self):
        res = Solution.mergeTwoLists(
            LinkedList([1, 2, 4]).head, LinkedList([1, 3, 4]).head
        )
        self.assertEqual(LinkedList.to_list(res), [1, 1, 2, 3, 4, 4])
        res = Solution.mergeTwoLists(LinkedList([]).head, LinkedList([]).head)
        self.assertEqual(LinkedList.to_list(res), [])
        res = Solution.mergeTwoLists(LinkedList([]).head, LinkedList([0]).head)
        self.assertEqual(LinkedList.to_list(res), [0])


if __name__ == "__main__":
    unittest.main()
