class Solution:
    @classmethod
    def rotate(self, matrix):
        l, r = 0, len(matrix) - 1

        while l < r:
            for i in range(r - l):
                top, bottom = l, r
                top_left = matrix[top][l + i]
                matrix[top][l + i] = matrix[bottom - i][l]
                matrix[bottom - i][l] = matrix[bottom][r - i]
                matrix[bottom][r - i] = matrix[top + i][r]
                matrix[top + i][r] = top_left

            r -= 1
            l += 1


matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
expected = [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
Solution.rotate(matrix)
print(matrix == expected)
