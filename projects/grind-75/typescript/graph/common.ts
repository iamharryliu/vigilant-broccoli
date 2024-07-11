export class _Node {
  val: number;
  neighbors: _Node[];

  constructor(val?: number, neighbors?: _Node[]) {
    this.val = val === undefined ? 0 : val;
    this.neighbors = neighbors === undefined ? [] : neighbors;
  }
}

export function buildGraph(adjList: number[][]): _Node | null {
  const nodes: { [key: number]: _Node } = {};

  adjList.forEach((neighbors, index) => {
    const val = index + 1;
    nodes[val] = new _Node(val);
  });

  adjList.forEach((neighbors, index) => {
    const val = index + 1;
    const node = nodes[val];
    neighbors.forEach(neighborVal => {
      node.neighbors.push(nodes[neighborVal]);
    });
  });

  return nodes[1] || null;
}

export function getAdjacencyList(node: _Node | null): number[][] {
  if (!node) {
    return [];
  }

  const adjList: { [key: number]: number[] } = {};
  const queue: _Node[] = [node];
  const visited: Set<_Node> = new Set();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!visited.has(current)) {
      visited.add(current);
      adjList[current.val] = current.neighbors.map(neighbor => neighbor.val);
      queue.push(...current.neighbors);
    }
  }

  const adjacencyList: number[][] = [];
  Object.keys(adjList)
    .sort()
    .forEach(key => {
      adjacencyList.push(adjList[parseInt(key)]);
    });

  return adjacencyList;
}
