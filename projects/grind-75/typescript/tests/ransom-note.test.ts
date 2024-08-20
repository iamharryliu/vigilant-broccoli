import canConstruct from '../string/ransom-note';

test('canConstruct', () => {
  expect(canConstruct('a', 'b')).toEqual(false);
  expect(canConstruct('aa', 'bb')).toEqual(false);
  expect(canConstruct('aa', 'aab')).toEqual(true);
});
