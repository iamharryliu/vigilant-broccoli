import { getPreviewDeployments } from '@vigilant-broccoli/github-workspace-js';
import { PreviewDeployments } from '@vigilant-broccoli/react-lib-higher-level';
import { CARD_ICONS, FALLBACK_ICON } from './WebApplicationsPage';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { PAGE_CLASS } from '../consts/layout';
import { DEPLOYMENTS_ROUTE } from '../consts/routes';

// No token: project-overview is static and public, so GitHub is called straight
// from the browser within the unauthenticated limit.
const loadPreviewDeployments = () => getPreviewDeployments();

// Nx project names carry a framework suffix the card ids lack
// (bookmarks-react -> bookmarks).
const FRAMEWORK_SUFFIX = /-(react|next|ui)$/;

const renderAppIcon = (app: string) => {
  const Icon =
    CARD_ICONS[app.replace(FRAMEWORK_SUFFIX, '')] ??
    CARD_ICONS[app] ??
    FALLBACK_ICON;
  return <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />;
};

export function DeploymentsPage() {
  const { t } = useTranslation();

  return (
    <main className={PAGE_CLASS}>
      <PageHeader
        title={t('DEPLOYMENTS_PAGE.TITLE')}
        route={DEPLOYMENTS_ROUTE}
      />
      <PreviewDeployments
        loadPreviewDeployments={loadPreviewDeployments}
        renderAppIcon={renderAppIcon}
      />
    </main>
  );
}
