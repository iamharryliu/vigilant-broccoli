import unittest
from graph.course_schedule import Solution


class TestSolution(unittest.TestCase):
    def test(self):
        res = Solution.canFinish(numCourses=2, prerequisites=[[1, 0]])
        self.assertEqual(res, True)
        res = Solution.canFinish(numCourses=2, prerequisites=[[1, 0], [0, 1]])
        self.assertEqual(res, False)
