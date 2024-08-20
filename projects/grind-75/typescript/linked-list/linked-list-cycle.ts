import { ListNode } from './common';

export default function hasCycle(head: ListNode | null): boolean {
  if (!head || !head.next) {
    return false;
  }
  let slow = head;
  let fast = head.next;
  while (slow !== fast) {
    if (!fast.next || !fast.next.next) {
      return false;
    }
    slow = slow.next!;
    fast = fast.next.next;
  }
  return true;
}
