# Toronto Alerts

## Stack

- Flask Web Application
- Postgres Database
- Utilizes webscraping for data
- Github Actions for CICD deployment.
- Serverless deployment with Docker containers

## Setup and run app.

Setup environment variables.

```
export SECRET_KEY='secret_key'
export GTA_UPDATE_ALERTS_DB='db'

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

## SQL

Commands

```
\c gta_update_alerts_db
SELECT * from emails;
```
