import { _Node } from './common';

export function cloneGraph(node: _Node | null): _Node | null {
  const store = new Map<number, _Node>();
  function dfs(node: _Node): _Node {
    if (store.has(node.val)) {
      return store.get(node.val) as _Node;
    }
    const copy = new _Node(node.val);
    store.set(node.val, copy);
    for (let neighbor of node.neighbors) {
      copy.neighbors.push(dfs(neighbor));
    }
    return copy;
  }
  return node ? dfs(node) : null;
}
