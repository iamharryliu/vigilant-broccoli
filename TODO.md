# TODO


## vigilant-broccoli
- **Light Tasks**
  - docs: Replace Obsidian brackets
- **New Features/Interfaces/Implementations**
  - feat: secret-manager secret rotation implementation
  - feat(vb-manager): Github organization/team manager
  - feat(vb-manager): Spotify DL manager
  - feat(vb-manager): text tools
  - feat(vb-manager): Google TODO list
  - feat(common-node): Bucket service implementation.
  - LLM Interfaces
    - feat(vb-manager): LLM tools
    - feat(common-node): LLM image analysis
    - feat(common-node): LLM image identification interface
  - feat(common-node): Stripe interface implementation
  - feat(cloud8skate): cloud8skate SSG, SEO, etc..
- **R&D**
  - chore: pihole reserach, pihole, pivpn, nordvpn integration
  - chore: iCloud vb notes
  - chore: Github wiki workflow.
- **Fix**
  - fix: fix DocsMD
  - fix: fix Toronto alerts
- chore: secure vb GC instance.
- feat: Setup linux vs mac setup scripts
- feat(immich): initial implementation
- feat(employee-handler):
  - inform user if gam or gyb needs to be setup
  - create missing folder/file structures
- feat: recipe markdown blog
- feat: city alerts
- chore: reassess Spotify API
- chore: dotfile cleanup
- chore: consider eslint proseWrap: "preserve"
- chore: alias for `alias run lib:nx-release-publish`?
- feat: Implement deadman switch.
- refactor(dotenv):
  - **dotenv refactor**
    - import 'dotenv-defaults/config';
  - remove instances of `process.env`
- **chore: Product Research**
  - research identification implementations
  - research iPhone finder implementation
- **feat: Email Service**
  - Queue
  - Can be called from separate apps
  - Can send emails on behalf of apps to appropriate people/parties
- **feat: Home Hanagement**
- Calendar Implementation
  - [fullcalendar](https://fullcalendar.io/docs/react)
  - Google Calendar integration
- chore: Next parallel route delete cache and .next

## AI Tools

- Event Poster creater

```
Generate a promotional graphic for skating events group for events with the following data for SOCIAL_MEDIA_CHOICE
event
{
  title
  description
  date
    starttime
    endtime
}
graphic
{
  events: event[]
  style
    modern
    urban
    grungy
    colorful
    minimalist
    retro
    vibrant party style?
}
```

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

- **NewTab Extension**
- **DocsMD**
  - Split into separate app.
  - Implement search bar.
- logging system
- RabbitMQ mail service

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
