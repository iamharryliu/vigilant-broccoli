import { TreeNode } from './common';

export default function isBalanced(root: TreeNode | null): boolean {
  let isBalanced = true;

  function dfs(node: TreeNode | null): number {
    if (!node) {
      return 0;
    }
    const maxHeightL = dfs(node.left);
    const maxHeightR = dfs(node.right);
    if (Math.abs(maxHeightL - maxHeightR) > 1) {
      isBalanced = false;
    }
    return Math.max(maxHeightL, maxHeightR) + 1;
  }

  dfs(root);

  return isBalanced;
}
