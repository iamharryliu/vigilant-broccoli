import { TreeNode } from './common';

export default function diameterOfBinaryTree(root: TreeNode | null): number {
  let res = 0;

  function dfs(node: TreeNode | null = root): number {
    if (!node) {
      return 0;
    }

    const left = dfs(node.left);
    const right = dfs(node.right);
    res = Math.max(res, left + right);
    return Math.max(left, right) + 1;
  }

  dfs();
  return res;
}
