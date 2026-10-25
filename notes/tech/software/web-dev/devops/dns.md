# DNS

## Table of Contents

- [Record Types](#record-types)
- [TTL](#ttl)

## Record Types

| Record | Name | Purpose |
| --- | --- | --- |
| A | Address | Maps a domain to an IPv4 address. |
| AAAA | IPv6 Address | Maps a domain to an IPv6 address. |
| CNAME | Canonical Name | Aliases one domain to another domain. |
| MX | Mail Exchange | Specifies the mail server that receives mail on behalf of the domain. |
| TXT | Text | Holds arbitrary text, such as SPF, DKIM and DMARC email-authentication policies and domain-ownership verification tokens. |

## TTL

- Every record has a TTL (time to live): the number of seconds resolvers may cache it before querying again.
- Lower the TTL (e.g. to 300) a day before changing a record so the change propagates quickly, then raise it again afterwards.
