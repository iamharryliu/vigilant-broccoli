import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import { CardListPage, CardListItem } from '../components/CardListPage';
import { GithubIcon } from '../components/BrandIcons';
import { PageHeader } from '../components/PageHeader';
import { PAGE_CLASS } from '../consts/layout';
import { fetchGithubRepos, GithubRepoInfo } from '../consts/githubRepos';

export function GithubReposPage() {
  const { t } = useTranslation();
  const [repos, setRepos] = useState<GithubRepoInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchGithubRepos(controller.signal)
      .then(setRepos)
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => controller.abort();
  }, []);

  const title = t('GITHUB_REPOS_PAGE.TITLE');
  if (!repos || repos.length === 0) {
    return (
      <main className={PAGE_CLASS}>
        <PageHeader title={title} />
        <p role="status" className="text-sm text-gray-600 dark:text-gray-400">
          {error
            ? t('GITHUB_REPOS_PAGE.ERROR', { message: error })
            : t(
                repos ? 'GITHUB_REPOS_PAGE.EMPTY' : 'GITHUB_REPOS_PAGE.LOADING',
              )}
        </p>
      </main>
    );
  }

  const items: CardListItem[] = repos.map(repo => ({
    key: repo.name,
    route: true,
    href: `/github/${encodeURIComponent(repo.name)}`,
    title: repo.name,
    description: repo.description ?? t('GITHUB_REPOS_PAGE.NO_DESCRIPTION'),
    icon: <GithubIcon />,
  }));

  return <CardListPage title={title} items={items} />;
}
