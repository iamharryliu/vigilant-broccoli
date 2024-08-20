import diameterOfBinaryTree from '../tree/diameter-of-bt';
import { BinaryTree } from '../tree/common';

test('levelOrder', () => {
  expect(diameterOfBinaryTree(BinaryTree.arrayToTree([1, 2, 3, 4, 5]))).toEqual(
    3,
  );
  expect(diameterOfBinaryTree(BinaryTree.arrayToTree([1, 2]))).toEqual(1);
});
