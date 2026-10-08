import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as lanDevicesRoute from './lan-devices.route';
import * as outboundConnectionsRoute from './outbound-connections.route';
import * as scanDeviceRoute from './scan-device.route';

const networkMonitorRoutes: FastifyPluginAsync = async app => {
  app.get('/lan-devices', webHandler(lanDevicesRoute.GET));
  app.get('/outbound-connections', webHandler(outboundConnectionsRoute.GET));
  app.post('/scan-device', webHandler(scanDeviceRoute.POST));
};

export default networkMonitorRoutes;
