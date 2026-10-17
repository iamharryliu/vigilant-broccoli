import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import {
  toGithubReadmeUrl,
  toGithubRepoLinkBase,
  toGithubRepoUrl,
} from '../consts/githubRepos';

export function GithubReadmePage() {
  const { t } = useTranslation();
  const { repo: slug } = useParams<{ repo: string }>();

  return (
    <ReadmePage
      title={slug ?? t('GITHUB_REPOS_PAGE.TITLE')}
      source={
        slug
          ? {
              url: toGithubReadmeUrl(slug),
              parseKind: PARSE_KIND.GITHUB_README,
            }
          : null
      }
      repoLinkBase={slug ? toGithubRepoLinkBase(slug) : undefined}
      externalHref={slug ? toGithubRepoUrl(slug) : undefined}
      externalLabel={t('README_PAGE.VIEW_ON_GITHUB')}
      notFoundMessage={t('README_PAGE.NOT_FOUND')}
    />
  );
}
