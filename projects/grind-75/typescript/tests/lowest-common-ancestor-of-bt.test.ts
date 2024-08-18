import lowestCommonAncestor from '../tree/lowest-common-ancestor-of-bt';
import { BinaryTree, TreeNode } from '../tree/common';

test('minWindow', () => {
  const p = new TreeNode(5);
  const q = new TreeNode(1);
  const expected = new TreeNode(3);

  expect(
    lowestCommonAncestor(
      BinaryTree.arrayToTree([expected, p, q, 6, 2, 0, 8, null, null, 7, 4]),
      p,
      q,
    ),
  ).toEqual(expected);
});

test('minWindow', () => {
  const p = new TreeNode(5);
  const q = new TreeNode(1);
  const expected = p;

  expect(
    lowestCommonAncestor(
      BinaryTree.arrayToTree([3, p, 1, 6, 2, 0, 8, null, null, 7, q]),
      p,
      q,
    ),
  ).toEqual(expected);
});
