import unittest
from linked_list.common import LinkedList
from linked_list.reverse_linked_list import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.reverseList(LinkedList([1, 2, 3, 4, 5]).head)
        self.assertEqual(LinkedList.to_list(res), [5, 4, 3, 2, 1])
        res = Solution.reverseList(LinkedList([1, 2]).head)
        self.assertEqual(LinkedList.to_list(res), [2, 1])


if __name__ == "__main__":
    unittest.main()
