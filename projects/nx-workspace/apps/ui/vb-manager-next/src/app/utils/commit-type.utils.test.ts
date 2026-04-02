import { getCommitType } from './commit-type.utils';

describe('getCommitType', () => {
  it('parses standard commit types', () => {
    expect(getCommitType('feat: add new feature')).toBe('feat');
    expect(getCommitType('fix: resolve bug')).toBe('fix');
    expect(getCommitType('chore: update deps')).toBe('chore');
    expect(getCommitType('docs: update readme')).toBe('docs');
    expect(getCommitType('refactor: clean up code')).toBe('refactor');
  });

  it('parses commit types with scope', () => {
    expect(getCommitType('feat(auth): add login')).toBe('feat');
    expect(getCommitType('fix(api): handle error')).toBe('fix');
  });

  it('parses commit types with alphanumeric characters', () => {
    expect(getCommitType('elva11: some task')).toBe('elva11');
    expect(getCommitType('ui2: update styles')).toBe('ui2');
    expect(getCommitType('cloud8skate: deploy')).toBe('cloud8skate');
  });

  it('strips Eisenhower quadrant prefix before parsing', () => {
    expect(getCommitType('Q1: feat: urgent feature')).toBe('feat');
    expect(getCommitType('Q2 fix: non-urgent bug')).toBe('fix');
    expect(getCommitType('Q3: elva11: task')).toBe('elva11');
    expect(getCommitType('q1: chore: lowercase quadrant')).toBe('chore');
  });

  it('returns other when no commit type found', () => {
    expect(getCommitType('just a plain task')).toBe('other');
    expect(getCommitType('')).toBe('other');
    expect(getCommitType('no colon here')).toBe('other');
  });

  it('returns commit type in lowercase', () => {
    expect(getCommitType('FEAT: uppercase type')).toBe('feat');
    expect(getCommitType('Fix: mixed case')).toBe('fix');
  });
});
