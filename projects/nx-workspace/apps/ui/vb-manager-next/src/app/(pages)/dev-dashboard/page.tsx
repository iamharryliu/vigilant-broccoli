'use client';

import { DockerStatusComponent } from '../../components/docker-status.component';
import { FlyIoAppsComponent } from '../../components/flyio-apps.component';
import { GcloudAuthStatusComponent } from '../../components/gcloud-auth-status.component';
import { GithubRepoActionStatusBadges } from '../../components/github-actions-status.component';
import { GithubTeamManager } from '../../components/github-manager.component';
import { PublicIpComponent } from '../../components/public-ip.component';
import { QuickLinksComponent } from '../../components/quick-links.component';
import { WireguardStatusComponent } from '../../components/wireguard-status.component';
import { WranglerPagesComponent } from '../../components/wrangler-pages.component';

export default function Page() {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      <div className="flex flex-col gap-4">
        <PublicIpComponent />
        <WireguardStatusComponent />
        <DockerStatusComponent />
      </div>
      <div className="flex flex-col gap-4">
        <GcloudAuthStatusComponent />
        <FlyIoAppsComponent />
        <WranglerPagesComponent />
      </div>
      <div className="flex flex-col gap-4">
        <GithubTeamManager />
        <GithubRepoActionStatusBadges repoUrl="https://github.com/iamharryliu/vigilant-broccoli" />
      </div>
      <div className="flex flex-col gap-4">
        <QuickLinksComponent />
      </div>
    </div>
  );
}
