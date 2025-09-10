# TODO

## vigilant-broccoli

- **feat:**
  - Immich POC
  - Dynamically change timer alert
  - **Secret Manager**
    - vault
      - vault seal keys
      - root token
    - secret rotation practice
  - **LM**
    - image identifier
  - **employee-handler**
    - inform user if gam or gyb needs to be setup
    - create missing folder/file structures
  - **vigilant-broccoli ui manager tool**
    - Github
      - organization/team manager
    - Spotify DL manager
    - LLM tools
    - text tools
  - **Email Service**
    - Queue
    - Can be called from separate apps
    - Can send emails on behalf of apps to appropriate people/parties
  - **Home Hanagement**
    - Calendar Implementation
      - [fullcalendar](https://fullcalendar.io/docs/react)
      - Google Calendar integration
  - asynchronous logging
  - move secret manager under DNS
  - Stripe implementation
  - AI image analysis
- fix:
  - fix toronto alerts
- chore:
  - iCloud vb notes??
  - hashicorp vault settings
    - document vault access
    - setup and understand SAN to be able to make local commands to vault
  - dotfile clean up
  - alias for `alias run lib:nx-release-publish`?
  - consider eslint proseWrap: "preserve"
- iPhone finder tool
- reassess Spotify API

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

## Employee Handler

- feat:
  - enhance employee handler
    - [Google Workspace best practices](https://www.reddit.com/r/gsuite/comments/1ap8a9j/looking_for_google_workspace_best_practices_tips/)
  - bucket service

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
- **dotenv refactor**
  - import 'dotenv-defaults/config';
- logging system
- RabbitMQ mail service

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
