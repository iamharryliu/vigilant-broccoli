import longestPalindrome from '../string/longest-palindrome';

test('twoSum', () => {
  expect(longestPalindrome('abccccdd')).toEqual(7);
  expect(longestPalindrome('a')).toEqual(1);
});
