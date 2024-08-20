import isBalanced from '../tree/balanced-bt';
import { BinaryTree } from '../tree/common';

test('minWindow', () => {
  expect(
    isBalanced(BinaryTree.arrayToTree([3, 9, 20, null, null, 15, 7])),
  ).toEqual(true);

  expect(
    isBalanced(BinaryTree.arrayToTree([1, 2, 2, 3, 3, null, null, 4, 4])),
  ).toEqual(false);

  expect(isBalanced(BinaryTree.arrayToTree([]))).toEqual(true);
});
