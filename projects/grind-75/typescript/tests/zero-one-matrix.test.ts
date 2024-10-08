import updateMatrix from '../matrix/zero-one-matrix';

test('updateMatrix', () => {
  expect(
    updateMatrix([
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ]),
  ).toEqual([
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ]);
  expect(
    updateMatrix([
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 1],
    ]),
  ).toEqual([
    [0, 0, 0],
    [0, 1, 0],
    [1, 2, 1],
  ]);
});
