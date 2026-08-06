import { useTranslation } from '../i18n';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import { REPO_URL, toRawGithubUrl } from '../consts/repo';

export function GithubReadmePage() {
  const { t } = useTranslation();

  return (
    <ReadmePage
      title={t('OPEN_SOURCE_PAGE.GITHUB.TITLE')}
      source={{ url: toRawGithubUrl('README.md'), parseKind: PARSE_KIND.TEXT }}
      externalHref={REPO_URL}
      externalLabel={t('README_PAGE.VIEW_ON_GITHUB')}
    />
  );
}
