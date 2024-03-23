# GTA Update Alerts Flask

## Setup and run app.

Setup app.

.env.sh

```
export SECRET_KEY='secret_key'
export GTA_UPDATE_ALERTS_DB='db'

```

```
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Run app.

```
flask --app app.py --debug run
```
