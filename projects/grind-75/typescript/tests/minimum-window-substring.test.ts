import minWindow from '../string/minimum-window-substring';

test('minWindow', () => {
  expect(minWindow('ADOBECODEBANC', 'ABC')).toEqual('BANC');
  expect(minWindow('a', 'a')).toEqual('a');
  expect(minWindow('a', 'aa')).toEqual('');
});
