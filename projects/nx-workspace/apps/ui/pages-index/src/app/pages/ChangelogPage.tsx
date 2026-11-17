import { useTranslation } from '../i18n';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import { REPO_URL, toRawGithubUrl, toRepoLinkBase } from '../consts/repo';

const CHANGELOG_PATH = 'CHANGELOG.md';
const MONTH_HEADING_LEVEL = 2;
const DEFAULT_OPEN_MONTHS = 1;

const MONTH_TITLE_RE = /^(\d{4})-(\d{2})$/;

// CHANGELOG.md headings stay `YYYY-MM` for the changelog automation; only the
// page shows the month name.
const formatMonthTitle = (title: string): string => {
  const match = MONTH_TITLE_RE.exec(title);
  if (!match) return title;
  return new Date(Date.UTC(+match[1], +match[2] - 1)).toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric', timeZone: 'UTC' },
  );
};

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
      collapsibleHeadingLevel={MONTH_HEADING_LEVEL}
      defaultOpenSections={DEFAULT_OPEN_MONTHS}
      formatSectionTitle={formatMonthTitle}
    />
  );
}
