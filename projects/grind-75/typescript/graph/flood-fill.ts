export function floodFill(
  image: number[][],
  sr: number,
  sc: number,
  color: number,
): number[][] {
  const oldColor: number = image[sr][sc];
  const visited: Set<string> = new Set();

  const dfs = (r: number, c: number): void => {
    image[r][c] = color;
    for (const [x, y] of [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ]) {
      const nr: number = r + x;
      const nc: number = c + y;
      const position: string = `${nr},${nc}`;
      if (
        0 <= nr &&
        nr < image.length &&
        0 <= nc &&
        nc < image[0].length &&
        !visited.has(position) &&
        image[nr][nc] === oldColor
      ) {
        visited.add(position);
        dfs(nr, nc);
      }
    }
  };

  dfs(sr, sc);
  return image;
}
