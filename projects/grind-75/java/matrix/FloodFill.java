package grind75.matrix;

public class FloodFill {
    private static final int[][] DIRECTIONS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    public static int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int oldColor = image[sr][sc];
        if (oldColor == color) {
            return image;
        }
        dfs(image, sr, sc, oldColor, color);
        return image;
    }

    private static void dfs(int[][] image, int r, int c, int oldColor, int color) {
        if (r < 0 || r >= image.length || c < 0 || c >= image[0].length || image[r][c] != oldColor) {
            return;
        }
        image[r][c] = color;
        for (int[] direction : DIRECTIONS) {
            dfs(image, r + direction[0], c + direction[1], oldColor, color);
        }
    }
}
