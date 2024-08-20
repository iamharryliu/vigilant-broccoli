import { LinkedList } from '../linked-list/common';
import reverseList from '../linked-list/reverse-linked-list';

test('reverseList', () => {
  let res = reverseList(new LinkedList([1, 2, 3, 4, 5]).head);
  expect(LinkedList.toList(res)).toEqual([5, 4, 3, 2, 1]);

  res = reverseList(new LinkedList([1, 2]).head);
  expect(LinkedList.toList(res)).toEqual([2, 1]);
});
