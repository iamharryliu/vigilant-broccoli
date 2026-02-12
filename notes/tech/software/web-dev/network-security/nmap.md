# nmap

## Nmap(Network Mapper)

Nmap is used for network mapping, vulnerability scanning, and port scanning. It can identify hosts, services, and operating systems on a network.

## Commands

### Short List

```
nmap <target>                          # Default scan
nmap -T4 -F <target>                   # Fast scan of common ports
nmap -sS -p- -T4 <target>              # All 65,535 TCP ports (stealth)
nmap -sV <target>                      # Detect service versions
nmap -O <target>                       # Attempt OS fingerprinting
nmap -A -T4 <target>                   # OS + version + scripts + traceroute
nmap -Pn <target>                      # Assume host is up
nmap -sU --top-ports 100 <target>      # Common UDP services
nmap -sC <target>                      # Run default NSE scripts
nmap --script vuln <target>            # Basic vulnerability checks
nmap 192.168.1.0/24                     # Scan local network range
nmap -oA scanname <target>             # Save in all formats (N, XML, GNMAP)
```

### More Commands

```
# Nmap Command Reference

## Core Scan Types

nmap <target>                    # Default scan (TCP SYN if privileged, TCP connect otherwise)
nmap -sT <target>                # TCP connect scan
nmap -sS <target>                # TCP SYN (stealth) scan
nmap -sU <target>                # UDP scan
nmap -sA <target>                # TCP ACK scan (firewall rule mapping)
nmap -sW <target>                # TCP window scan
nmap -sM <target>                # TCP Maimon scan
nmap -sN <target>                # TCP NULL scan
nmap -sF <target>                # TCP FIN scan
nmap -sX <target>                # TCP Xmas scan

## Port Selection

nmap -p 80 <target>              # Scan a single port
nmap -p 22,80,443 <target>       # Scan specific ports
nmap -p 1-1000 <target>          # Scan port range
nmap -p- <target>                # Scan all 65,535 TCP ports
nmap --top-ports 100 <target>    # Scan top 100 most common ports
nmap -F <target>                 # Fast scan (top 100 ports)

## Service / OS / Version Detection

nmap -sV <target>                     # Service version detection
nmap -O <target>                      # OS detection
nmap -A <target>                      # Aggressive scan (OS, version, scripts, traceroute)
nmap --version-intensity 5 <target>   # Set version detection intensity (0–9)
nmap --osscan-guess <target>          # Guess OS more aggressively

## NSE (Nmap Scripting Engine)

nmap -sC <target>                # Run default scripts
nmap --script vuln <target>      # Run vulnerability scripts
nmap --script discovery <target> # Run discovery scripts
nmap --script http-* <target>    # Run HTTP-related scripts
nmap --script smb-* <target>     # Run SMB-related scripts
nmap --script ftp-anon <target>  # Check for anonymous FTP login
nmap --script ssh-brute <target> # SSH brute-force script

## Host Discovery

nmap -sn <target>                # Ping scan (no port scan)
nmap -Pn <target>                # Treat host as up (skip host discovery)
nmap -PS22,80,443 <target>       # TCP SYN ping on specific ports
nmap -PA80 <target>              # TCP ACK ping
nmap -PE <target>                # ICMP echo request
nmap -PP <target>                # ICMP timestamp request

## Timing / Performance

nmap -T0 <target>                # Paranoid (very slow)
nmap -T1 <target>                # Sneaky
nmap -T2 <target>                # Polite
nmap -T3 <target>                # Normal (default)
nmap -T4 <target>                # Aggressive
nmap -T5 <target>                # Insane (fast, less reliable)
nmap --min-rate 1000 <target>    # Set minimum packet rate
nmap --max-retries 2 <target>    # Limit retransmissions

## Output Options

nmap -oN output.txt <target>     # Normal output
nmap -oX output.xml <target>     # XML output
nmap -oG output.gnmap <target>   # Grepable output
nmap -oA scanname <target>       # All formats (normal, XML, grepable)
nmap -v <target>                 # Verbose output
nmap -vv <target>                # Very verbose

## Evasion / Firewall Bypass

nmap -f <target>                      # Fragment packets
nmap --mtu 16 <target>                # Set custom MTU size
nmap -D RND:10 <target>               # Use decoys
nmap -S <spoofed_ip> <target>         # Spoof source IP
nmap --source-port 53 <target>        # Spoof source port
nmap --data-length 200 <target>       # Append random data to packets

## Target Input

nmap 192.168.1.0/24                    # Scan subnet
nmap 192.168.1.1-50                    # Scan IP range
nmap -iL targets.txt                   # Scan targets from file
nmap -iR 10                            # Scan 10 random targets
nmap --exclude 192.168.1.5 <range>     # Exclude host

## Useful Combinations

nmap -sS -sV -T4 -p- <target>               # Full TCP scan with version detection
nmap -sU -sV --top-ports 200 <target>       # Common UDP ports with version detection
nmap -A -T4 <target>                        # Common aggressive assessment scan
nmap -Pn -p- -T4 <target>                   # Scan all ports even if ping is blocked
```
