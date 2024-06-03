import unittest
from heap.find_median_from_data_stream import MedianFinder


class TestSolution(unittest.TestCase):
    def test(self):
        res = []
        q = None
        commands = zip(
            ["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"],
            [[], [1], [2], [], [3], []],
        )
        for command, val in commands:
            if command == "MedianFinder":
                medianFinder = MedianFinder()
                res.append(None)
            if command == "addNum":
                medianFinder.addNum(val[0])
                res.append(None)
            if command == "findMedian":
                res.append(medianFinder.findMedian())
        self.assertEqual(res, [None, None, None, 1.5, None, 2.0])
