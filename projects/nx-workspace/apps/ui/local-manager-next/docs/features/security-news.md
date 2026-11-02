# Security News

## Overview

- Route: `/security-news`; reachable from Home quick links and Search (no right-sidebar entry).
- Lists only exploitable or large-scale issues from the last 7 days that affect products in the stack; routine releases and general tech news are dropped.
- Shows "Nothing big to report." when nothing qualifies.

## Sources and filtering

- Feeds and the product keyword list live in `src/app/api/security-news/_lib/security-news.feeds.ts`; add a feed or product there.
- An item needs a stack-product keyword match and a severity signal: CISA KEV listing, critical GitHub advisory (severity `critical` or CVSS 9+), or a keyword signal (actively exploited, zero-day, RCE, supply-chain compromise, breach, major outage).
- `GET /api/security-news` fetches all feeds in parallel and caches the result in memory for 30 minutes; a failing feed is listed on the page and does not block the rest.
- Matching is rule-based, so a novel phrasing can be missed.
