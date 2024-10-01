# TODO

## vigilant-broccoli

- Q1
  - feat(setup): Standardize sh paths.
  - feat(work): Implement work specific shortcuts.
  - feat(harryliu.design): Migration to new domain..
  - feat(new-tab):
    - https://chatgpt.com/share/66fbad8d-c07c-800b-887f-0b94a05d6579
    - https://chatgpt.com/share/66fbaf44-e4cc-800b-93d3-5d6f38071f00
    - Calendar
    - Weather
  - feat(secrets-manager):
    - Setup Hashicorp Vault.
    - Github CLI manager
- Q2
  - refactor(nx-libs):
    - Refactor nx libs to be able to use @vigilant-broccoli/scripts
  - docs:
    - Browser media downloads for offline use (like YouTube downlaods)
    - How to build online payment form?
    - Hpw to handle open ssh port at home? https://www.reddit.com/r/hacking/comments/17qah4p/secure_ssh_to_home_computer/
  - fix(nx): publish -> build caching preventing new dist
  - docs(monitor-apps): cleaner way to store apps that need to be monitored
  - feat(dj-scripts): spotify playlist scrape
    - Handle [Spotify rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits).
    - Fix playlists output.
  - feat(cms-flask):
    - Dynamic page contents.
      - Blogs.
      - Image galleries.
    - Handle receiving emails for message requests.
    - Virus scanning for uploads.
  - feat(app-monitor): Budget alerts for services.
  - feat(setup):
    - Setup macOS application privacy and security a11y.
    - Recursive makevenv.
  - feat(malmo-alert):
    - Malmo weather alert such as rain alerts.
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
