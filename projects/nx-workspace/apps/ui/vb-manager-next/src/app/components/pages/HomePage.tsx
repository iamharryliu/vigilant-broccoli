'use client';

import { Heading } from '@radix-ui/themes';
import { StatusBadges } from '../github-actions-status.component';
import { GithubTeamManager } from '../github-manager.component';
import { LinksTable } from '../links-table.component';

export const HomePage = () => {
  return (
    <>
      <Heading>vigilant-broccoli Manager</Heading>
      <LinksTable />
      <StatusBadges />
      <GithubTeamManager />
    </>
  );
};
