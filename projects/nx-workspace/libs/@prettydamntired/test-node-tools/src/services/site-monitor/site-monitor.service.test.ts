import { SiteMonitor } from './site-monitor.service';

describe('SiteMonitor', () => {
  it('should be created', () => {
    const siteMonitor = new SiteMonitor();
    expect(siteMonitor).toBeTruthy();
  });
});
