import { Flex, Text } from '@radix-ui/themes';
import { GithubActionsBadgeLink } from '@vigilant-broccoli/react-lib';

const MOCK_REPO = 'iamharryliu/vigilant-broccoli';
const MOCK_WORKFLOWS = ['ci.yml', 'deploy.yml', 'lint.yml', 'tests.yml'];

const MOCK_BADGES = MOCK_WORKFLOWS.map(workflow => ({
  alt: workflow.replace('.yml', ''),
  href: `https://github.com/${MOCK_REPO}/actions/workflows/${workflow}`,
  src: `https://github.com/${MOCK_REPO}/actions/workflows/${workflow}/badge.svg`,
}));

export const GithubActionsBadgesDemo = () => (
  <Flex direction="column" gap="3">
    <Text size="2" color="gray">
      Hover a badge to see the lift + scale + shadow animation.
    </Text>
    <Flex direction="column" gap="2">
      {MOCK_BADGES.map(badge => (
        <GithubActionsBadgeLink key={badge.alt} badge={badge} />
      ))}
    </Flex>
  </Flex>
);
