# Linux

```
sudo apt update
sudo apt install iputils-ping
sudo apt install git

sudo systemctl start <service_name>
sudo systemctl stop <service_name>
sudo systemctl restart <service_name>
# Reload a service (without stopping it)
sudo systemctl reload <service_name>
sudo systemctl status <service_name>
systemctl is-enabled <service_name>
systemctl is-active <service_name>
sudo systemctl enable <service_name>
sudo systemctl disable <service_name>

sudo journalctl -u <service_name>
# Follow live logs
sudo journalctl -u <service_name> -f
# View logs since last boot
sudo journalctl -u <service_name> -b
sudo journalctl -u <service_name> -n <number_of_lines>
```
