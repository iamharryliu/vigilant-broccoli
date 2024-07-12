import { isValid } from '../string/valid-parenthesis';

test('isValid', () => {
  expect(isValid('()')).toBe(true);
  expect(isValid('()[]{}')).toBe(true);
  expect(isValid('(]')).toBe(false);
});
