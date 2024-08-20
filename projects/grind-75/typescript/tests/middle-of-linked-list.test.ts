import { LinkedList } from '../linked-list/common';
import middleNode from '../linked-list/middle-of-the-linked-list';

test('middleNode', () => {
  let res = middleNode(new LinkedList([1, 2, 3, 4, 5]).head);
  expect(LinkedList.toList(res)).toEqual([3, 4, 5]);
  res = middleNode(new LinkedList([1, 2, 3, 4, 5, 6]).head);
  expect(LinkedList.toList(res)).toEqual([4, 5, 6]);
});
