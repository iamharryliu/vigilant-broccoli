'use client';

import { AwsManagementComponent } from '../../components/aws-management.component';
import { DockerStatusComponent } from '../../components/docker-status.component';
import { FlyIoAppsComponent } from '../../components/flyio-apps.component';
import { GcloudAuthStatusComponent } from '../../components/gcloud-auth-status.component';
import { GithubRepoActionStatusBadges } from '../../components/github-actions-status.component';
import { GithubTeamManager } from '../../components/github-manager.component';
import { GithubPagesComponent } from '../../components/github-pages.component';
import { PM2StatusComponent } from '../../components/pm2-status.component';
import { PublicIpComponent } from '../../components/public-ip.component';
import { TailscaleMachinesComponent } from '../../components/tailscale-machines.component';
import { WireguardStatusComponent } from '../../components/wireguard-status.component';
import { WranglerPagesComponent } from '../../components/wrangler-pages.component';
import { VercelAppsComponent } from '../../components/vercel-apps.component';
import { LocalServicesComponent } from '../../components/local-services.component';

export default function Page() {
  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <div className="flex flex-col gap-4">
        <PublicIpComponent />
        <WireguardStatusComponent />
        <TailscaleMachinesComponent />
        <PM2StatusComponent />
        <DockerStatusComponent />
        <LocalServicesComponent />
      </div>
      <div className="flex flex-col gap-4">
        <GcloudAuthStatusComponent />
        <AwsManagementComponent />
        <FlyIoAppsComponent />
        <VercelAppsComponent />
        <WranglerPagesComponent />
        <GithubPagesComponent />
      </div>
      <div className="flex flex-col gap-4">
        <GithubTeamManager />
        <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
      </div>
    </div>
  );
}
