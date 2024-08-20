import { LinkedList } from '../linked-list/common';
import hasCycle from '../linked-list/linked-list-cycle';

test('hasCycle', () => {
  expect(hasCycle(new LinkedList([3, 2, 0, -4], 1).head)).toEqual(true);
  expect(hasCycle(new LinkedList([1, 2], 0).head)).toEqual(true);
  expect(hasCycle(new LinkedList([1], -1).head)).toEqual(false);
});
