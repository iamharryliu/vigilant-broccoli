export const DEFAULT_MOCK = {
  organizationName: 'gh-managment-test-org',
  teams: [
    {
      name: 'a',
      members: [
        {
          username: 'iamharryliu',
          role: 'maintainer',
        },
      ],
      teams: [
        {
          name: 'aa',
          members: [
            {
              username: 'iamharryliu',
              role: 'maintainer',
            },
          ],
          teams: [],
          repositories: [],
        },
        {
          name: 'ab',
          members: [
            {
              username: 'iamharryliu',
              role: 'maintainer',
            },
          ],
          teams: [],
          repositories: [],
        },
      ],
      repositories: [],
    },
    {
      name: 'b',
      members: [
        {
          username: 'iamharryliu',
          role: 'maintainer',
        },
      ],
      teams: [
        {
          name: 'ba',
          members: [
            {
              username: 'iamharryliu',
              role: 'maintainer',
            },
          ],
          teams: [],
          repositories: [],
        },
        {
          name: 'bb',
          members: [
            {
              username: 'iamharryliu',
              role: 'maintainer',
            },
          ],
          teams: [],
          repositories: [],
        },
      ],
      repositories: [],
    },
  ],
};

export const DEFAULT_MOCK_LESS_1_TEAM = {
  organizationName: 'gh-managment-test-org',
  teams: [
    {
      name: 'a',
      members: [
        {
          username: 'iamharryliu',
          role: 'maintainer',
        },
      ],
      teams: [
        {
          name: 'aa',
          members: [
            {
              username: 'iamharryliu',
              role: 'maintainer',
            },
          ],
          teams: [],
          repositories: [],
        },
        {
          name: 'ab',
          members: [
            {
              username: 'iamharryliu',
              role: 'maintainer',
            },
          ],
          teams: [],
          repositories: [],
        },
      ],
      repositories: [],
    },
    {
      name: 'b',
      members: [
        {
          username: 'iamharryliu',
          role: 'maintainer',
        },
      ],
      teams: [
        {
          name: 'ba',
          members: [
            {
              username: 'iamharryliu',
              role: 'maintainer',
            },
          ],
          teams: [],
          repositories: [],
        },
        {
          name: 'bb',
          members: [
            {
              username: 'iamharryliu',
              role: 'maintainer',
            },
          ],
          teams: [],
          repositories: [],
        },
      ],
      repositories: [],
    },
  ],
};

export const DEFAULT_MOCK_NO_TEAMS = {
  organizationName: 'gh-managment-test-org',
  teams: [],
};
