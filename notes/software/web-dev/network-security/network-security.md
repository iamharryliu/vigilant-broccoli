# Network Security

- [Have I Been Pwned?](https://haveibeenpwned.com/)
- [Password Generator](https://passwordsgenerator.net/)
- [How to Choose a Password - Computerphile](https://www.youtube.com/watch?v=3NjQ9b3pgIg)

## General Guidelines

- Never trust user input.
- Never store secrets on a client-side application.

## Types of Authentication

- API Key - Generated key used to pass through requests to access API.
- OAuth - Clientside application will redirect to a third party authorization (Google, Facebook, Apple, etc) and grant an OAuth Token.
- SSO -When the user signs in sucessfully they are granted an authentication token that is used to remember the user is verified.
- OTP - One time password that is passed to the user usually via email or password.

## Types of Attacks

### Password Cracking

- Brute force
  - Works on short passwords or passwords that use limited amount of characters.

### Distributed Denial of Service (DDoS)

Ways to protect against DDoS:

- Firewall
- Rate Limiting
- Content Delivery Network (CDN)
- Traffic Monitoring
- Blacklist/Whitelist

### Timing Attacks

- Attack based on how long something takes
- Steal secrets via timing differences
- Brute-forcing a password char by char
- Prevent using constant-time operations

## Tools

- [Network Tools](./network-secrurity-tools/network-tools.md)
- [OSINT Tools](./network-secrurity-tools/osint-tools.md)
- [Password Cracking Tools]()
- [Penetration Testing Tools]()
- [Wireless Security Tools]()
