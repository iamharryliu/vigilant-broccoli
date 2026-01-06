# TODO

## Storage Handling Practices

- Image Storage Solution
  - Cloud storage
  - Physical storage
  - Backups
  - Accessibility - Immich implementation?
- Machine storage handling

## vigilant-broccoli

- **machine**
  - audit default pip list
- **vb-api**
  - Message Service - Email, text
  - Payment Service
- **vb-cms**
  - Dynamic page contents ie blogs, image gallery
  - Handle receiving emails for message requests.
  - Virus scanning for uploads.
  - refactor(cms): Refactor Flask CMS to nx-workspace..
- **Infrastructure**
  - GCP VM
    - Bootstrapping Vault and WireGuard
- **employee-handler**
  - Inform user if gam or gyb needs to be setup.
  - Create missing folder/file structures.
- **Fix/`Chore`**
  - Fix MY_EMAIL
  - chore: Replace Obsidian brackets. `[[something]]`
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

- Food Planning
  - Recipes
    - Recipe scraper
    - Recipe reviews
  - Recipe Suggester
    - Fridge Inventory + Saved Recipes -> LLM -> Suggested Recipes -> Grocery List
- Leisure
  - Shows
  - Movies
  - Crafts
- Home Projects
- Co-operative living tools.
- Vehicle Calendar
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
- Remember It
  - An item finder, search to image memory tool.
  - Image library to remember where things are
    - Keyword/tag searching
    - Create Entry
      - name
      - description
      - image[]

## Personal Planning Application

- Consume
  - Google Tasks
  - Journal TODO
  - vb TODO
  - Google Calendar
- Output Suggestion
- Implement with Claude Workflow - `/vb-plan-day`, `/vb-plan-week`
