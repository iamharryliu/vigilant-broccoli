import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';
import {
  CardContainer,
  GithubActionsBadges,
} from '@vigilant-broccoli/react-lib';

const REPO_URL = 'https://github.com/iamharryliu/vigilant-broccoli';

export const GithubActionsBadgesDemo = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <DemoSection
        title={t('DEMO_SECTION.GITHUB_ACTIONS_BADGES.WRAPPED_CARDCONTAINER')}
        className="flex flex-col gap-3"
      >
        <CardContainer
          title="GitHub Actions"
          headerLink={{ href: `${REPO_URL}/actions`, label: 'View All' }}
        >
          <div className="flex flex-col gap-2">
            <GithubActionsBadges repoUrl={REPO_URL} />
          </div>
        </CardContainer>
      </DemoSection>

      <DemoSection
        title={t('DEMO_SECTION.GITHUB_ACTIONS_BADGES.NON_WRAPPED')}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-wrap gap-1.5">
          <GithubActionsBadges repoUrl={REPO_URL} />
        </div>
      </DemoSection>
    </div>
  );
};
