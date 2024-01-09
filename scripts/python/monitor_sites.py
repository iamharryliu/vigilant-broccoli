from site_monitor import SiteMonitor
import json

with open("/etc/sites.json") as f:
    servers = json.load(f)

if __name__ == "__main__":
    SiteMonitor.check_servers(servers)
