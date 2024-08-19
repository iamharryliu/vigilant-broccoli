export default function updateMatrix(mat: number[][]): number[][] {
    const q: [number, number][] = [];
    const visited = new Set<string>();
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[0].length; c++) {
            if (mat[r][c] === 0) {
                visited.add(`${r},${c}`);
                q.push([r, c]);
            }
        }
    }

    while (q.length > 0) {
        const [r, c] = q.shift()!;
        for (const [x, y] of directions) {
            const nr = r + x;
            const nc = c + y;
            if (
                nr >= 0 && nr < mat.length &&
                nc >= 0 && nc < mat[0].length &&
                !visited.has(`${nr},${nc}`)
            ) {
                visited.add(`${nr},${nc}`);
                q.push([nr, nc]);
                mat[nr][nc] = mat[r][c] + 1;
            }
        }
    }

    return mat;
};