# TODO

## vigilant-broccoli

- Q1
  - feat(harryliu.design): Migration to new domain..
- Q2

  - docs:
    - Look into better git workflows. ie commit > pull --rebase > push
    - Checkout github CLI manager, https://cli.github.com/manual/gh_secret_set
    - Browser media downloads for offline use (like YouTube downlaods)
    - Look into handling DDOS attacks.
    - How to build online payment form?
    - Hpw to handle open ssh port at home? https://www.reddit.com/r/hacking/comments/17qah4p/secure_ssh_to_home_computer/
  - feat: automate upgrades
    - brew upgrade visual-studio-code
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
