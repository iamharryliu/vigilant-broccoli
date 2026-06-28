'use client';

import { LanDevicesComponent } from '../../components/lan-devices.component';
import { LocalServicesComponent } from '../../components/local-services.component';
import { OutboundConnectionsComponent } from '../../components/outbound-connections.component';

export default function Page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="flex flex-col gap-4">
        <LanDevicesComponent />
      </div>
      <div className="flex flex-col gap-4">
        <OutboundConnectionsComponent />
      </div>
      <div className="flex flex-col gap-4">
        <LocalServicesComponent />
      </div>
    </div>
  );
}
