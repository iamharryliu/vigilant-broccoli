import { GithubRepoActionStatusBadges } from '../../components/github-actions-status.component';
import { GithubTeamManager } from '../../components/github-manager.component';
import { Heading } from '@radix-ui/themes';

export default function Page() {
  return (
    <>
      <Heading>vigilant-broccoli Manager</Heading>
      <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
      <GithubTeamManager />
    </>
  );
}
