class Solution:
    @classmethod
    def setZeroes(self, matrix):
        """
        Do not return anything, modify matrix in-place instead.
        """
        num_of_rows = len(matrix)
        num_of_cols = len(matrix[0])
        row_zero = False
        col_zero = False

        # set first values to zero
        for r in range(num_of_rows):
            for c in range(num_of_cols):
                if matrix[r][c] == 0:
                    if r == 0:
                        row_zero = True
                    if c == 0:
                        col_zero = True
                    matrix[0][c] = 0
                    matrix[r][0] = 0

        for r in range(1, num_of_rows):
            for c in range(0, num_of_cols):
                if matrix[0][c] == 0 or matrix[r][0] == 0:
                    matrix[r][c] = 0

        # convert first column to zeroes if col_zero
        if col_zero:
            for r in range(num_of_rows):
                matrix[r][0] = 0

        # set first row to zeroes if row_zero
        if row_zero:
            for c in range(num_of_cols):
                matrix[0][c] = 0


matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
actual = Solution.setZeroes(matrix)
expected = [[1, 0, 1], [0, 0, 0], [1, 0, 1]]
print(matrix == expected)
