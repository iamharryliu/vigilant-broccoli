import { SiteMonitor } from './site-monitor.service';

describe('SiteMonitor', () => {
  it('should work', () => {
    expect(SiteMonitor.getSiteStatus).toBeTruthy();
  });
});
