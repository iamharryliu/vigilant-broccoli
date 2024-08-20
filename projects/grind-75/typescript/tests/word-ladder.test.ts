import { ladderLength } from '../graph/word-ladder';

test('ladderLength', () => {
  const beginWord = 'hit';
  const endWord = 'cog';
  const wordList = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];
  expect(ladderLength(beginWord, endWord, wordList)).toEqual(5);
});

test('ladderLength', () => {
  const beginWord = 'hit';
  const endWord = 'cog';
  const wordList = ['hot', 'dot', 'dog', 'lot', 'log'];
  expect(ladderLength(beginWord, endWord, wordList)).toEqual(0);
});
