'use client';

import { useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { APP_NAME } from './app.const';
import { DockerStatusComponent } from './components/docker-status.component';
import { LocalCredentialsComponent } from './components/local-credentials.component';
import { LanDevicesComponent } from './components/lan-devices.component';
import { LocalServicesComponent } from './components/local-services.component';
import { NetworkMapComponent } from './components/network-map/network-map.component';
import { OutboundConnectionsComponent } from './components/outbound-connections.component';
import { PM2StatusComponent } from './components/pm2-status.component';
import { PublicIpComponent } from './components/public-ip.component';
import { TailscaleMachinesComponent } from './components/tailscale-machines.component';
import { WireguardStatusComponent } from './components/wireguard-status.component';
import { useTranslation } from './i18n';

export default function Page() {
  const { t } = useTranslation();
  useDocumentTitle(`${t('LOCAL.TITLE')} | ${APP_NAME}`);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <div className="flex flex-col gap-4">
        <PublicIpComponent />
        <WireguardStatusComponent />
        <TailscaleMachinesComponent />
      </div>
      <div className="flex flex-col gap-4">
        <LocalServicesComponent />
        <LocalCredentialsComponent />
      </div>
      <div className="flex flex-col gap-4">
        <DockerStatusComponent />
        <PM2StatusComponent />
      </div>
      <div className="lg:col-span-2">
        <NetworkMapComponent />
      </div>
      <div className="flex flex-col gap-4">
        <LanDevicesComponent />
        <OutboundConnectionsComponent />
      </div>
    </div>
  );
}
