# TODO

cat service-account.json | jq -c .
base64 -i service-account.json -o encoded.txt
echo "${{ secrets.GOOGLE_SERVICE_ACCOUNT }}" | base64 -d > service-account.json

## vigilant-broccoli

- feat:
  - alias for gcp instance `gcloud compute ssh --zone "us-east1-b" "vb-free-vm" --project "vigilant-broccoli"`
  - asynchronous logging
- fix:
  - fix toronto alerts
- chore:
  - hashicorp vault settings
    - document vault access
    - setup and understand SAN to be able to make local commands to vault
  - dotfile clean up
  - alias for `alias run lib:nx-release-publish`?
  - consider eslint proseWrap: "preserve"

## Employee Handler

- feat:

  - enhance employee handler

    - [Google Workspace best practices](https://www.reddit.com/r/gsuite/comments/1ap8a9j/looking_for_google_workspace_best_practices_tips/)

  - bucket service

- **Home Management**

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
  - Item Finder
    - Image library to remember where things are
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
