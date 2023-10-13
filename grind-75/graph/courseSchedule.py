from collections import defaultdict


class Solution:
    @classmethod
    def canFinish(self, numCourses, prerequisites):
        graph = defaultdict(list)
        for a, b in prerequisites:
            graph[a].append(b)
        visited = set()

        def dfs(course):
            if course in visited:
                return True
            if graph[course] == []:
                return False
            visited.add(course)
            for pre in graph[course]:
                if dfs(pre):
                    return True
            visited.remove(course)
            graph[course] = []
            return False

        for course in range(numCourses):
            if dfs(course):
                return False
        return True


numCourses = 2
prerequisites = [[1, 0]]
res = Solution.canFinish(numCourses, prerequisites)
print(res)
prerequisites = [[1, 0], [0, 1]]
res = Solution.canFinish(numCourses, prerequisites)
print(res)
