import unittest
from binary_search.first_bad_version import VersionService, Solution


# Not testable
class TestSolution(unittest.TestCase):
    def test(self):
        VersionService.set_bad_version(bad=4)
        Solution.firstBadVersion(n=5)

        VersionService.set_bad_version(bad=1)
        Solution.firstBadVersion(n=1)
