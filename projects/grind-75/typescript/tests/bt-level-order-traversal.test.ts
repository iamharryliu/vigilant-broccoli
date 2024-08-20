import levelOrder from '../tree/bt-level-order-traversal';
import { BinaryTree } from '../tree/common';

test('levelOrder', () => {
  expect(
    levelOrder(BinaryTree.arrayToTree([3, 9, 20, null, null, 15, 7])),
  ).toEqual([[3], [9, 20], [15, 7]]);
  expect(levelOrder(BinaryTree.arrayToTree([1]))).toEqual([[1]]);
  expect(levelOrder(BinaryTree.arrayToTree([]))).toEqual([]);
});
