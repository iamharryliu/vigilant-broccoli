{
  echo "GTA_UPDATE_ALERT_EMAIL=${GTA_UPDATE_ALERT_EMAIL}"
  echo "GTA_UPDATE_ALERT_EMAIL_PASSWORD=${GTA_UPDATE_ALERT_EMAIL_PASSWORD}"
} >> /etc/environment

set -e

mkdir -p /app/var/log
crontab /app/etc/crontab
cron

python3 -m flask run --host=0.0.0.0 --port=8080
