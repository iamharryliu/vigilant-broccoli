export const MAX_TODO_REMOVAL_REASON_LENGTH = 500;

// Mirrors the Type order in docs/todo-pattern.md; types missing here are listed
// after these, alphabetically.
export const TODO_TYPE_ORDER = [
  'Security',
  'Performance',
  'Maintenance',
  'Chore',
  'Refactor',
  'Feature Enhancements',
  'UI Cleanup',
  'Not so serious',
];

export const TODO_STATUS_LEGEND = [
  {
    field: 'Priority',
    values: [
      { value: 'P1', meaning: 'Highest priority; fix first.' },
      { value: 'P2', meaning: 'Important; schedule soon.' },
      { value: 'P3', meaning: 'Worth doing when there is time.' },
      {
        value: 'NA',
        meaning: 'Nice-to-have or a deliberately accepted risk.',
      },
    ],
  },
  {
    field: 'Effort',
    values: [
      { value: 'S', meaning: 'One file or config block, under an hour.' },
      { value: 'M', meaning: 'Several files or one service, about a session.' },
      {
        value: 'L',
        meaning: 'Spans services or needs ordered, separately mergeable PRs.',
      },
    ],
  },
  {
    field: 'Agent',
    values: [
      {
        value: 'auto',
        meaning: 'An agent can implement and verify it entirely in a PR.',
      },
      {
        value: 'assisted',
        meaning:
          'An agent writes the change; a person finishes it outside the PR (Terraform apply, secret rotation, npm publish, console setting).',
      },
      {
        value: 'human',
        meaning:
          'Hands-on work such as hardware or third-party account setup; an agent can at most update docs afterwards.',
      },
    ],
  },
] as const;

export type TodoStatusField = (typeof TODO_STATUS_LEGEND)[number]['field'];

// Legend values are listed in rank order, so they double as sort keys; a value
// missing from its list sorts last.
export const TODO_SORT_RANKS = Object.fromEntries(
  TODO_STATUS_LEGEND.map(({ field, values }) => [
    field,
    values.map(({ value }) => value as string),
  ]),
) as Record<TodoStatusField, string[]>;
