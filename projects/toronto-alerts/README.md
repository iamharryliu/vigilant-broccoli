# Toronto Alerts

## Roadmap

- Q1

  - implement analytics
  - defense

    - guard users endpoint with github actions whitelist or performing cron within the server instance?
    - contact gtaupdate dude

  - application unit testing
  - ui:
    - autocomplete tagging
  - TTC notifications

    - building twitter service to scrape tweets with Tweepy
      - https://developer.twitter.com/en/products/twitter-api
      - $100 per month
    - TTC email services
      - https://www.ttc.ca/my-ttc-eservices
      - script to check for new emails
      - free
    - try to scrape this api endpoint
      - https://alerts.ttc.ca/api/alerts/live-alerts
      - https://www.ttc.ca/service-alerts
    - parse data and email all applicable users

- Q2
  - mobile application
    - Google android store, 1 time cost of $25
    - Apple Store, yearly cost of $99
  - text notifications
    - https://www.twilio.com/en-us/sms/pricing/ca
- Q3

  - blog section for SEO
  - proper email

    - migrate to use ui app?
