const COMMIT_TYPES = [
  'feat',
  'fix',
  'ci',
  'chore',
  'docs',
  'refactor',
  'enhancement',
  'security',
  'infrastructure',
];

const ERROR = 2;
const DISABLED = 0;

const startsWithCapital = parsed => /^\p{Lu}/u.test(parsed.subject ?? '');

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'subject-starts-with-capital': parsed => [
          startsWithCapital(parsed),
          'subject must start with a capital letter',
        ],
      },
    },
  ],
  rules: {
    'type-enum': [ERROR, 'always', COMMIT_TYPES],
    'scope-case': [ERROR, 'always', 'lower-case'],
    'subject-full-stop': [ERROR, 'always', '.'],
    'subject-case': [DISABLED],
    'subject-starts-with-capital': [ERROR, 'always'],
    'header-max-length': [DISABLED],
    'body-max-line-length': [DISABLED],
    'footer-max-line-length': [DISABLED],
  },
};
