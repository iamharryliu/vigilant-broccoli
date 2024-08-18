export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

export class BinaryTree {
  static arrayToTree(arr: (number | TreeNode | null)[]): TreeNode | null {
    if (!arr.length) {
      return null;
    }

    const nodes: (TreeNode | null)[] = [];

    for (const val of arr) {
      if (val === null) {
        nodes.push(null);
      } else if (typeof val === 'number') {
        nodes.push(new TreeNode(val));
      } else {
        nodes.push(val);
      }
    }

    for (let i = 0; i < arr.length; i++) {
      const leftIndex = 2 * i + 1;
      const rightIndex = 2 * i + 2;

      if (leftIndex < arr.length && nodes[i] !== null) {
        nodes[i]!.left = nodes[leftIndex];
      }

      if (rightIndex < arr.length && nodes[i] !== null) {
        nodes[i]!.right = nodes[rightIndex];
      }
    }

    return nodes[0];
  }

  static toBfsTraversalArray(root: TreeNode | null): (number | null)[] {
    const res: (number | null)[] = [];
    if (!root) {
      return res;
    }

    const queue: (TreeNode | null)[] = [root];

    while (queue.length && queue.some(node => node !== null)) {
      const node = queue.shift()!;
      if (node) {
        res.push(node.val);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        res.push(null);
      }
    }

    return res;
  }
}
