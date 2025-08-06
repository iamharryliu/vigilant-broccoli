# Network Tools

## Nmap(Network Mapper)

Nmap is used for network mapping, vulnerability scanning, and port scanning. It can identify hosts, services, and operating systems on a network.

```
nmap <target>  # Basic scan to find open ports on the target (IP or domain)
nmap -p <port> <target>  # Scans specific ports on the target (replace <port> with port number or range)
nmap -sV <target>  # Detects the version of services running on open ports
nmap -O <target>  # Attempts to detect the target's operating system
nmap -A <target>  # Combines OS detection, version detection, script scanning, and traceroute
nmap -sn <target>  # Ping scan to check if hosts are up (no port scan)
nmap 192.168.1.0/24  # Scans all hosts in the specified subnet (replace with your range)
nmap <IP-range>
nmap -sS <target>  # Performs a stealthy SYN scan (less detectable)
nmap -sU <target>  # Scans UDP ports (useful for services like DNS, DHCP)
nmap -p- <target>  # Scans all 65,535 TCP ports on the target
nmap -oN output.txt <target>  # Saves the scan results in human-readable format
nmap -oX output.xml <target>  # Saves the scan results in XML format
nmap -sC <target>  # Runs Nmap's default scripts for vulnerability scanning
nmap --traceroute <target>  # Performs a traceroute to show network path to the target
nmap -n <target>  # Disables DNS resolution for faster scanning (doesn't resolve hostnames)
nmap -iL targets.txt  # Scans a list of targets provided in a file (replace with your filename)
```

## Netcat

Often referred to as the “Swiss army knife” of networking, Netcat can be used for port scanning, transferring files, and network communication.

## Wireshark

Wireshark captures and analyzes network traffic, allowing security professionals to see what is happening on a network at a packet level.

## References

- [nmap](./network-secrurity-tools/osint-tools.md)
- [Wireshark](https://www.wireshark.org/)
