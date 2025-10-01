'use client';

import { Heading } from '@radix-ui/themes';
import { GithubRepoActionStatusBadges } from '../github-actions-status.component';
import { GithubTeamManager } from '../github-manager.component';
// import { LinksTable } from '../links-table.component';

export const HomePage = () => {
  return (
    <>
      <Heading>vigilant-broccoli Manager</Heading>
      {/* <LinksTable /> */}
      <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
      <GithubTeamManager />
    </>
  );
};
