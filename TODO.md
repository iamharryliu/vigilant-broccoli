# TODO

- Employee Handler
  - implement ui
  - Refactor
  - Specify receivers of zipped email signatures
- Dotfiles
  - Nx
    - alias run lib:nx-release-publish
- DocsMD
  - Split into separate app.
  - Implement search bar.
- dotenv
  - import 'dotenv-defaults/config';
- logging system
- Google Free Tier Instance
- RabbitMQ mail service
- Docs
  - Stripe
  - Hashicorp Vault
  - Prisma
  - microservices vs monoliths
  - RabbitMQ vs Kafka
  - Load balancing
  - Honeypot vs Recaptcha
  - [Employee Handler](https://www.reddit.com/r/gsuite/comments/1ap8a9j/looking_for_google_workspace_best_practices_tips/)

## vigilant-broccoli

- Q1
  - docs: find Postman replacement.
  - fix(nx-workspace): check nx caching??
  - fix(nx): publish -> build caching preventing new dist

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
