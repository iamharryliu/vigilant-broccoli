import MyQueue from '../array/implement-queue-using-stacks';

describe('MyQueue', () => {
  test('should perform operations correctly', () => {
    const res: (number | boolean | null)[] = [];
    let q: MyQueue | null = null;

    const commands: [string, number[]][] = [
      ['MyQueue', []],
      ['push', [1]],
      ['push', [2]],
      ['peek', []],
      ['pop', []],
      ['empty', []],
    ];

    commands.forEach(([command, val]) => {
      if (command === 'MyQueue') {
        q = new MyQueue();
        res.push(null);
      } else if (command === 'push') {
        q!.push(val[0]);
        res.push(null);
      } else if (command === 'pop') {
        res.push(q!.pop());
      } else if (command === 'peek') {
        res.push(q!.peek());
      } else if (command === 'empty') {
        res.push(q!.empty());
      }
    });

    const expected: (number | boolean | null)[] = [
      null,
      null,
      null,
      1,
      1,
      false,
    ];

    expect(res).toEqual(expected);
  });
});
