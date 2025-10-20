# TODO

## vigilant-broccoli

- **Current Tasks**
  - chore: secure vb GC instance.
- **Light Tasks**
  - docs: Replace Obsidian brackets.
  - chore: [GeForce Maplestory](https://support-maplestory.nexon.com/hc/en-us/articles/23609853001876-How-to-play-MapleStory-through-GeForce-NOW)
  - chore: Managing git stashes.
  - chore: Account scrubbing.
- **Implementations**
  - feat(immich): Initial implementation.
  - feat: Implement deadman switch.
- **Intensive Audit/Refactor Tasks**
  - refactor(dotenv):
    - **dotenv refactor**
      - import 'dotenv-defaults/config';
    - remove instances of `process.env`
  - feat: Setup linux vs mac setup scripts
  - chore: dotfile cleanup
  - chore: reassess Spotify API
- **New Features/Interfaces/Implementations**
  - feat: Secret-manager secret rotation implementation.
  - feat(vb-manager): Github organization/team manager.
  - feat(email-service):
    - Queue (RabbitMQ)
    - Can be called from separate apps
    - Can send emails on behalf of apps to appropriate people/parties
  - feat(employee-handler):
    - Inform user if gam or gyb needs to be setup.
    - Create missing folder/file structures.
  - feat(docs-md):
    - Split into separate app.
    - Implement search bar.
  - feat(common-node): Bucket service implementation.
  - LLM Interfaces
    - feat(common-node): LLM image analysis
    - feat(common-node): LLM image identification interface
  - feat(common-node): Stripe interface implementation
  - feat(cloud8skate): cloud8skate SSG, SEO, etc..
  - feat(vb-manager): Spotify DL manager.
  - feat(vb-manager): Google TODO list.
- **New Features**
  - feat: home management
    - Calendar Implementation
      - [fullcalendar](https://fullcalendar.io/docs/react)
      - Google Calendar integration
  - feat: recipe markdown blog
- **R&D**
  - chore: Github wiki workflow.
  - chore: Pihole reserach, pihole, pivpn, nordvpn integration.
  - chore: iCloud vb notes.
  - chore: Research identification implementations
  - chore: Research iPhone finder implementation
  - chore: Next parallel route delete cache and .next
  - chore: consider eslint proseWrap: "preserve"
  - chore: alias for `alias run lib:nx-release-publish`?
  - chore(storage-solution): RAID QNAP NAS
  - chore: Look into Zapier uses.
  - chore: [Advanced typescript uses.](https://chatgpt.com/c/68f103dc-74c8-8328-8f2c-796bcd9b2037)
  - chore: Node build term lingo, ie esbuild, webpack, swc, etc..
- **Fix**
  - fix: fix DocsMD
  - fix: fix Toronto alerts

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
