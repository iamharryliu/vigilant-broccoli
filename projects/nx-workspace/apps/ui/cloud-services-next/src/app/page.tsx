'use client';

import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { APP_NAME } from './app.const';
import { AwsManagementComponent } from './components/aws-management.component';
import { FlyIoAppsComponent } from './components/flyio-apps.component';
import { GcloudAuthStatusComponent } from './components/gcloud-auth-status.component';
import { GithubPagesComponent } from './components/github-pages.component';
import { RenderServicesComponent } from './components/render-services.component';
import { TerraformStatusComponent } from './components/terraform-status.component';
import { VercelAppsComponent } from './components/vercel-apps.component';
import { WranglerPagesComponent } from './components/wrangler-pages.component';
import { useTranslation } from './i18n';

export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('CLOUD.TITLE')} | ${APP_NAME}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <div className="flex flex-col gap-4">
        <GcloudAuthStatusComponent />
        <AwsManagementComponent />
        <TerraformStatusComponent />
      </div>
      <div className="flex flex-col gap-4">
        <FlyIoAppsComponent />
        <RenderServicesComponent />
      </div>
      <div className="flex flex-col gap-4">
        <VercelAppsComponent />
        <WranglerPagesComponent />
        <GithubPagesComponent />
      </div>
    </div>
  );
}
