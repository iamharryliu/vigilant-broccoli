# WireGuard

## Commands

```
sudo wg
sudo wg show

ping 10.0.0.1
ping 10.0.0.2

sudo wg-quick down wg0
sudo wg-quick up wg0

sudo sysctl -w net.ipv4.ip_forward=0
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -p

ufw status
sudo ufw allow in on wg0 to any port 8200
sudo ufw deny in on eth0 to any port 8200
```

## Setup

```
sudo apt update
sudo apt install wireguard -y
priv=$(wg genkey); echo "privatekey: $priv"; echo "publickey: $(echo $priv | wg pubkey)"

# VPN Server
sudo vim /etc/wireguard/wg0.conf

[Interface]
PrivateKey = <SERVER_PRIVATE_KEY>
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <CLIENT_PUBLIC_KEY>
AllowedIPs = 10.0.0.X/32

# Client
vim /opt/homebrew/etc/wireguard/wg0.conf

[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>
Address = 10.0.0.X/24
MTU=1280

[Peer]
PublicKey = <SERVER_PUBLIC_KEY>
Endpoint = <SERVER_IP_ADDRESS>:51820
AllowedIPs = 10.0.0.0/24
PersistentKeepalive = 25

sudo wg-quick up wg0

# Automatic start on boot.
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
sudo systemctl status wg-quick@wg0
```
