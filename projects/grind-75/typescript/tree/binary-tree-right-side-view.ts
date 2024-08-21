import { TreeNode } from './common';

export default function rightSideView(root: TreeNode | null): number[] {
  const result: number[] = [];
  if (!root) return result;

  const queue: TreeNode[] = [root];
  let start = 0;

  while (start < queue.length) {
    const levelSize = queue.length - start;
    result.push(queue[queue.length - 1].val);

    for (let i = 0; i < levelSize; i++) {
      const node = queue[start];

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
      start++;
    }
  }

  return result;
}
