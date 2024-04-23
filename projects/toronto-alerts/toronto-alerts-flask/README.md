# Toronto Alerts

## Stack

- [Python Flask Framework](https://flask.palletsprojects.com/en/3.0.x/)
- [Postgres Database](https://fly.io/docs/postgres/)
- [Python Web Scraping with BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Github Actions for CICD deployment](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/)
- [FlyIO Serverless deployment with Docker](https://fly.io/docs/languages-and-frameworks/dockerfile/)

## Setup and run app.

Setup environment variables.

```
export SECRET_KEY='secret_key'
export GTA_UPDATE_ALERTS_DB=""
export GTA_UPDATE_ALERT_EMAIL="email"
export GTA_UPDATE_ALERT_EMAIL_PASSWORD="password"
export GTA_UPDATE_ALERTS_RECAPTCHA_SITE_KEY="key"
export GTA_UPDATE_ALERTS_RECAPTCHA_SECRET_KEY="key"
```

Setup Python environment.

```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Run app.

```
flask --app app.py --debug run
```

## Commands

```
flaskrun
```

## SQL

Commands

```
\c gta_update_alerts_db
SELECT * from emails;
```

## References

- [OpenWeather Current Weather Data API Call](https://openweathermap.org/current)
- [TTC API](https://alerts.ttc.ca/api/alerts/live-alerts)
- [GTA Update](https://gtaupdate.com/)
