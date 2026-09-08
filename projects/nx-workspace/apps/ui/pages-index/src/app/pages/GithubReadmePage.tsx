import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import { findGithubRepo, toGithubRepoUrl } from '../consts/githubRepos';
import { toRawGithubUrl } from '../consts/repo';

export function GithubReadmePage() {
  const { t } = useTranslation();
  const { repo: slug } = useParams<{ repo: string }>();
  const repo = findGithubRepo(slug);

  return (
    <ReadmePage
      title={repo ? repo.slug : t('GITHUB_REPOS_PAGE.TITLE')}
      source={
        repo
          ? {
              url: toRawGithubUrl(repo.readmePath),
              parseKind: PARSE_KIND.TEXT,
            }
          : null
      }
      externalHref={repo ? toGithubRepoUrl(repo.slug) : undefined}
      externalLabel={t('README_PAGE.VIEW_ON_GITHUB')}
      notFoundMessage={t('README_PAGE.NOT_FOUND')}
    />
  );
}
