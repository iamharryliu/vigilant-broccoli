# Network Security

## General Guidelines

- Never trust user input.
- Never store secrets on a client-side application.

## Password Cracking

- Brute force
  - Works on short passwords or passwords that use limited amount of characters.
- [Choosing Passwords](https://www.youtube.com/watch?v=3NjQ9b3pgIg)

## OSINT

## Commands

```
# Router Details
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I
```

### ARP (Address Resolution Protocol)

```
arp -a
```

### Nmap - Network Mapper

```
nmap -sn 192.168.1.1/24
```
