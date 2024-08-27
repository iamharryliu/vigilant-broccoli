export default class MyQueue {
  private stack1: number[];
  private stack2: number[];

  constructor() {
    this.stack1 = [];
    this.stack2 = [];
  }

  push(x: number): void {
    while (this.stack1.length > 0) {
      this.stack2.push(this.stack1.pop()!);
    }
    this.stack1.push(x);
    while (this.stack2.length > 0) {
      this.stack1.push(this.stack2.pop()!);
    }
  }

  pop(): number {
    return this.stack1.pop()!;
  }

  peek(): number {
    return this.stack1[this.stack1.length - 1];
  }

  empty(): boolean {
    return this.stack1.length === 0;
  }
}
