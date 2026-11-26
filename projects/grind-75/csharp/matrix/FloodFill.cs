namespace Grind75;

public static class FloodFill
{
    private static readonly int[][] Directions = { new[] { 1, 0 }, new[] { -1, 0 }, new[] { 0, 1 }, new[] { 0, -1 } };

    public static int[][] Solve(int[][] image, int sr, int sc, int color)
    {
        var oldColor = image[sr][sc];
        if (oldColor == color)
        {
            return image;
        }
        Dfs(image, sr, sc, oldColor, color);
        return image;
    }

    private static void Dfs(int[][] image, int r, int c, int oldColor, int color)
    {
        if (r < 0 || r >= image.Length || c < 0 || c >= image[0].Length || image[r][c] != oldColor)
        {
            return;
        }
        image[r][c] = color;
        foreach (var direction in Directions)
        {
            Dfs(image, r + direction[0], c + direction[1], oldColor, color);
        }
    }
}
