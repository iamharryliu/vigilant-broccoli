import rightSideView from '../tree/binary-tree-right-side-view';
import { BinaryTree } from '../tree/common';

test('rightSideView', () => {
  expect(
    rightSideView(BinaryTree.arrayToTree([1, 2, 3, null, 5, null, 4])),
  ).toEqual([1, 3, 4]);
  expect(rightSideView(BinaryTree.arrayToTree([1, null, 3]))).toEqual([1, 3]);
  expect(rightSideView(BinaryTree.arrayToTree([]))).toEqual([]);
});
