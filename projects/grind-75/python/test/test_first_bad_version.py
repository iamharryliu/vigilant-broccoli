import unittest
from binary_search.first_bad_version import VersionService, Solution


# Not testable
class TestSolution(unittest.TestCase):
    def test(self):
        VersionService.set_bad_version(bad=4)
        res = Solution.firstBadVersion(n=5)
        self.assertEqual(res, 4)

        VersionService.set_bad_version(bad=1)
        res = Solution.firstBadVersion(n=1)
        self.assertEqual(res, 1)
