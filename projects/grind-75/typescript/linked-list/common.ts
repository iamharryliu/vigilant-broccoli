export class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

export class LinkedList {
  head: ListNode | null;

  constructor(head: number[] = [], pos: number = -1) {
    this.head = null;
    if (head.length > 0) {
      this.appendNumbers(head);
    }
    if (pos >= 0) {
      let curr = this.head as ListNode | null;
      let posNode: ListNode | null = null;
      let i = 0;
      while (curr && curr.next) {
        if (i === pos) {
          posNode = curr;
        }
        i += 1;
        curr = curr.next;
      }
      if (curr) {
        curr.next = posNode;
      }
    }
  }

  append(data: number): void {
    const newNode = new ListNode(data);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let lastNode = this.head;
    while (lastNode.next) {
      lastNode = lastNode.next;
    }
    lastNode.next = newNode;
  }

  appendNumbers(nums: number[]): void {
    for (const num of nums) {
      this.append(num);
    }
  }

  static toList(head: ListNode | null): number[] {
    const res: number[] = [];
    let curr: ListNode | null = head;
    while (curr) {
      res.push(curr.val);
      curr = curr.next;
    }
    return res;
  }
}
