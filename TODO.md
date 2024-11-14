# TODO

## vigilant-broccoli

- Q1
  - fix(nx-workspace): check nx caching??
  - build:
    - Handle FlyIO scaling issue, `flyctl autoscale disable`
  - feat:
    - new-implementations:
      - [Implement Stripe Payment](https://chatgpt.com/share/670ea37b-e270-800b-a503-7751ec53c0a6)
      - Deploy Hashicorp Vault.
        - https://chatgpt.com/c/670ebe78-b264-800b-8e7a-fe132a9f59e4
        - https://chatgpt.com/c/670f96b0-6868-800b-97bc-724cd4b461bf
      - Utilize Github CLI manager?
      - Recursive makevenv.
    - setup:
      - macOS application privacy and security a11y.
- Q2
  - docs: Open source licensing.
  - docs:
    - Browser media downloads for offline use (like YouTube downlaods)
    - Hpw to handle open ssh port at home? https://www.reddit.com/r/hacking/comments/17qah4p/secure_ssh_to_home_computer/
  - fix(nx): publish -> build caching preventing new dist
  - feat(app-monitor): Budget alerts for services.

## New Tab Dashboard

- feat(new-tab):
  - https://chatgpt.com/share/66fbad8d-c07c-800b-887f-0b94a05d6579
  - https://chatgpt.com/share/66fbaf44-e4cc-800b-93d3-5d6f38071f00
  - Calendar
  - Weather

## CMS

- feat:
  - Dynamic page contents.
    - Blogs.
  - Handle receiving emails for message requests.
  - Virus scanning for uploads.

## Malmo Alerts

- feat:
  - Malmo weather alert such as rain alerts.

## Toronto Alerts

- feat(toronto-alerts):
  - https://www.theweathernetwork.com/en/city/ca/ontario/toronto/current
  - update email header to be more explicit
  - Select hours to get notified for weather subscription.
  - Select subway and bus lines to subscribe to.
  - Populate upcoming events.
- fix(toronto-alerts):
  - Weird bug with manual deploy, venv/bin/python does not exist..

## Cloud8

- feat:
  - Implement newsletter.

# Vibecheck

- Q1
- Q2
  - technical delivery plan
    - docs: release app in phases
    - enhance: new getRecommendation fn for current weather
  - marketing plan
    - pay cheap influencers to use the application
  - fix: loading spinner
    - loads late??
    - helper text not hidden (maybe delete it)
  - refactor: introduce service files?
  - fix: fly deploy slow?
