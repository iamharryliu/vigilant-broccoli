import { Text } from '@radix-ui/themes';
import { CardContainer, GithubActionsBadges } from '@vigilant-broccoli/react-lib';

const REPO_URL = 'https://github.com/iamharryliu/vigilant-broccoli';

export const GithubActionsBadgesDemo = () => (
  <div className="flex flex-col gap-6">
    <Text size="2" color="gray">
      Hover a badge to see the lift + scale + shadow animation. Fetches
      workflows for vigilant-broccoli from the GitHub API on mount.
    </Text>

    <div className="flex flex-col gap-3">
      <Text size="2" weight="bold">
        Wrapped (CardContainer)
      </Text>
      <CardContainer
        title="GitHub Actions"
        headerLink={{ href: `${REPO_URL}/actions`, label: 'View All' }}
      >
        <div className="flex flex-col gap-2">
          <GithubActionsBadges repoUrl={REPO_URL} />
        </div>
      </CardContainer>
    </div>

    <div className="flex flex-col gap-3">
      <Text size="2" weight="bold">
        Non-wrapped
      </Text>
      <div className="flex flex-wrap gap-1.5">
        <GithubActionsBadges repoUrl={REPO_URL} />
      </div>
    </div>
  </div>
);
