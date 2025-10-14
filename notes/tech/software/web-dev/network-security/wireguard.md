# WireGuard

## Commands

```

sudo wg

ping 10.0.0.1
ping 10.0.0.2

sudo wg-quick down wg0
sudo wg-quick up wg0

sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -p

sudo ufw allow in on wg0 to any port 8200
sudo ufw deny in on eth0 to any port 8200
```

## Setup

```
wg genkey | tee privatekey | wg pubkey > publickey

# VPN Server
sudo nano /etc/wireguard/wg0.conf

[Interface]
PrivateKey = <AWS_PRIVATE_KEY>
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <LOCAL_PUBLIC_KEY>
AllowedIPs = 10.0.0.2/32


# Client
sudo nano /etc/wireguard/wg0.conf
vim /opt/homebrew/etc/wireguard/wg0.conf

[Interface]
PrivateKey = <LOCAL_PRIVATE_KEY>
Address = 10.0.0.2/24

[Peer]
PublicKey = <AWS_PUBLIC_KEY>
Endpoint = <AWS_PUBLIC_IP>:51820
AllowedIPs = 10.0.0.0/24
PersistentKeepalive = 25

sudo wg-quick up wg0
```
