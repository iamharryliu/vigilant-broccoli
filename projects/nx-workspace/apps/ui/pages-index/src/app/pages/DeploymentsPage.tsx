import { getPreviewDeployments } from '@vigilant-broccoli/github-workspace-js';
import { PreviewDeployments } from '@vigilant-broccoli/react-lib-higher-level';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { PAGE_CLASS } from '../consts/layout';
import { DEPLOYMENTS_ROUTE } from '../consts/routes';

// No token: pages-index is static and public, so GitHub is called straight
// from the browser within the unauthenticated limit.
const loadPreviewDeployments = () => getPreviewDeployments();

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
        showServerTokenHint={false}
      />
    </main>
  );
}
