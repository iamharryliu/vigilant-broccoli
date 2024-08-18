import lengthOfLongestSubstring from '../string/longest-substring-without-repeating-characters';

test('lengthOfLongestSubstring', () => {
  expect(lengthOfLongestSubstring('abcabcbb')).toEqual(3);
  expect(lengthOfLongestSubstring('bbbbb')).toEqual(1);
  expect(lengthOfLongestSubstring('pwwkew')).toEqual(3);
});
