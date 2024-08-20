import maxDepth from '../tree/maximum-depth-of-bt';
import { BinaryTree } from '../tree/common';

test('minWindow', () => {
  expect(
    maxDepth(BinaryTree.arrayToTree([3, 9, 20, null, null, 15, 7])),
  ).toEqual(3);

  expect(maxDepth(BinaryTree.arrayToTree([1, null, 2]))).toEqual(2);
});
