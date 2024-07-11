class VersionService:
    bad_version = 0

    @classmethod
    def set_bad_version(self, bad: int):
        VersionService.bad_version = bad


def isBadVersion(version: int):
    if version >= VersionService.bad_version:
        return True
    return False


class Solution:
    @classmethod
    def firstBadVersion(self, n: int) -> int:
        l = 1
        r = n
        while l <= r:
            mid = (l + r) // 2
            if isBadVersion(mid):
                r = mid - 1
            else:
                l = mid + 1
        return l
