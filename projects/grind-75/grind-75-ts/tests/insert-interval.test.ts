import { insert } from '../insert-interval';

describe('inserInterval', () => {
  test('insert works as expected', () => {
    let res = insert(
      [
        [1, 3],
        [6, 9],
      ],
      [2, 5],
    );
    expect(res).toEqual([
      [1, 5],
      [6, 9],
    ]);

    res = insert(
      [
        [1, 2],
        [3, 5],
        [6, 7],
        [8, 10],
        [12, 16],
      ],
      [4, 8],
    );
    expect(res).toEqual([
      [1, 2],
      [3, 10],
      [12, 16],
    ]);
  });
});
