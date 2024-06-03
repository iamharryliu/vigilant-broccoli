import { floodFill } from '../flood-fill';

test('floodFill', () => {
  let res = floodFill(
    [
      [1, 1, 1],
      [1, 1, 0],
      [1, 0, 1],
    ],
    1,
    1,
    2,
  );
  expect(res).toEqual([
    [2, 2, 2],
    [2, 2, 0],
    [2, 0, 1],
  ]);

  res = floodFill(
    [
      [0, 0, 0],
      [0, 0, 0],
    ],
    0,
    0,
    0,
  );
  expect(res).toEqual([
    [0, 0, 0],
    [0, 0, 0],
  ]);
});
