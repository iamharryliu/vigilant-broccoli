import { useTranslation } from '../i18n';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import { REPO_URL, toRawGithubUrl, toRepoLinkBase } from '../consts/repo';

const CHANGELOG_PATH = 'CHANGELOG.md';

export function ChangelogPage() {
  const { t } = useTranslation();

  return (
    <ReadmePage
      title={t('CHANGELOG_PAGE.TITLE')}
      source={{
        url: toRawGithubUrl(CHANGELOG_PATH),
        parseKind: PARSE_KIND.TEXT,
      }}
      repoLinkBase={toRepoLinkBase(CHANGELOG_PATH)}
      externalHref={`${REPO_URL}/blob/main/${CHANGELOG_PATH}`}
      externalLabel={t('README_PAGE.VIEW_ON_GITHUB')}
    />
  );
}
