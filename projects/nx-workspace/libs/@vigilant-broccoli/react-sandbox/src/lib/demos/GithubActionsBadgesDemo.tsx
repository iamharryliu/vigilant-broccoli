import { Text } from '@radix-ui/themes';
import {
  GithubActionsBadgeLink,
  GithubActionsBadges,
} from '@vigilant-broccoli/react-lib';

const MOCK_REPO = 'iamharryliu/vigilant-broccoli';
const MOCK_WORKFLOWS = ['ci.yml', 'deploy.yml', 'lint.yml', 'tests.yml'];
const LIVE_REPO_URL = 'https://github.com/iamharryliu/vigilant-broccoli';

const MOCK_BADGES = MOCK_WORKFLOWS.map(workflow => ({
  alt: workflow.replace('.yml', ''),
  href: `https://github.com/${MOCK_REPO}/actions/workflows/${workflow}`,
  src: `https://github.com/${MOCK_REPO}/actions/workflows/${workflow}/badge.svg`,
}));

export const GithubActionsBadgesDemo = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3">
      <Text size="2" color="gray">
        Hover a badge to see the lift + scale + shadow animation.
      </Text>
      <div className="flex flex-col gap-2">
        {MOCK_BADGES.map(badge => (
          <GithubActionsBadgeLink key={badge.alt} badge={badge} />
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <Text size="2" weight="bold">
        Live fetch (GithubActionsBadges)
      </Text>
      <Text size="2" color="gray">
        Fetches workflows for the given repo from the GitHub API on mount.
      </Text>
      <div className="flex flex-wrap gap-1.5">
        <GithubActionsBadges repoUrl={LIVE_REPO_URL} />
      </div>
    </div>
  </div>
);
