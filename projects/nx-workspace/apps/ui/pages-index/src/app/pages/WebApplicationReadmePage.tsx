import { ExternalLink } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { CardLink } from '../components/CardLink';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import { REPO_URL, toRawGithubUrl } from '../consts/repo';
import WEB_APPLICATIONS from '../consts/webApplications.json';

type TranslationKey = Parameters<ReturnType<typeof useTranslation>['t']>[0];

export function WebApplicationReadmePage() {
  const { t } = useTranslation();
  const { app: id } = useParams<{ app: string }>();
  const app = [
    ...WEB_APPLICATIONS.applications,
    ...WEB_APPLICATIONS.demos,
  ].find(entry => entry.id === id);

  return (
    <ReadmePage
      key={id}
      title={
        app
          ? t(app.titleKey as TranslationKey)
          : t('WEB_APPLICATIONS_PAGE.TITLE')
      }
      beforeReadme={
        app && (
          <div className="mb-6">
            <CardLink
              href={app.href}
              title={t('WEB_APPLICATIONS_PAGE.OPEN_APPLICATION')}
              description={app.href}
              icon={
                <ExternalLink className="h-5 w-5 shrink-0" aria-hidden="true" />
              }
            />
          </div>
        )
      }
      source={
        app
          ? { url: toRawGithubUrl(app.readmePath), parseKind: PARSE_KIND.TEXT }
          : null
      }
      externalHref={app ? `${REPO_URL}/blob/main/${app.readmePath}` : undefined}
      externalLabel={t('README_PAGE.VIEW_ON_GITHUB')}
      notFoundMessage={t('README_PAGE.NOT_FOUND')}
    />
  );
}
