import { GithubTeamManager } from '../../components/github-manager.component';
import { Heading } from '@radix-ui/themes';

export default function Page() {
  return (
    <>
      <Heading>vigilant-broccoli Manager</Heading>
      <GithubTeamManager />
    </>
  );
}
