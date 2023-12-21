import unittest
from heap.task_scheduler import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.leastInterval(tasks=["A", "A", "A", "B", "B", "B"], n=2)
        self.assertEqual(res, 8)
        res = Solution.leastInterval(tasks=["A", "A", "A", "B", "B", "B"], n=0)
        self.assertEqual(res, 6)
        res = Solution.leastInterval(
            tasks=["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], n=2
        )
        self.assertEqual(res, 16)
