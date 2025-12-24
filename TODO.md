# TODO

## Image Storage Solution

- Cloud storage
- Physical storage
- Backups
- Accessibility - Immich implementation?

## vigilant-broccoli

- **Infrastructure**
  - GCP VM
    - Terraform for GCP VM
    - Bootstrapping Vault and WireGuard
- **common-node**
  - Bucket service implementation.
- **Microservices**
  - Email service.
  - Text service.
  - Payment service.
  - refactor(cms): Refactor Flask CMS to nx-workspace..
- **employee-handler**
  - Inform user if gam or gyb needs to be setup.
  - Create missing folder/file structures.
- **Chore**
  - Replace Obsidian brackets. `[[something]]`
- **Audit/Refactor Tasks**
  - feat: Setup linux vs mac setup scripts
  - chore: dotfile cleanup
- **New Features/Interfaces/Implementations**
  - feat(cloud8skate): cloud8skate SSG, SEO, etc..
- **New Features**
  - feat: home management
    - Calendar Implementation
      - [fullcalendar](https://fullcalendar.io/docs/react)
      - Google Calendar integration
- **R&D**
  - chore: Pihole reserach, pihole, pivpn, nordvpn integration.
  - chore: iCloud vb notes.
  - chore: Research identification implementations
  - chore: Research iPhone finder implementation
  - chore: alias for `alias run lib:nx-release-publish`?

## Home Management

- Co-operative living tools.
- **Vehicle Calendar**
  - Calendar for booking behicle.
  - Create Booking
    - Vehicle
      - Name
      - Model
      - Notes
  - View Bookings
  - Edit Booking
  - Rules
- Household Rules
  - Create Rule
    - name
    - description
    - position
- **Remember It** - An item finder, search to image memory tool.
- - Image library to remember where things are
  - Keyword/tag searching
  - Create Entry
    - name
    - description
    - image[]

## CMS

- feat:
  - Dynamic page contents.
    - Blogs.
  - Handle receiving emails for message requests.
  - Virus scanning for uploads.

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
