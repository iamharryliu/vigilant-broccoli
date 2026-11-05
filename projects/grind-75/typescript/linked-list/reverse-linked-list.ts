import { ListNode } from './common';

export default function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;

  while (head) {
    const curr = head;
    head = curr.next;
    curr.next = prev;
    prev = curr;
  }

  return prev;
}
