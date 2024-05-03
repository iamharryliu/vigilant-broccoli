echo 'Setting environment variables.'

{
  echo "GTA_UPDATE_ALERT_EMAIL=${GTA_UPDATE_ALERT_EMAIL}"
  echo "GTA_UPDATE_ALERT_EMAIL_PASSWORD=${GTA_UPDATE_ALERT_EMAIL_PASSWORD}"
  echo "GTA_UPDATE_ALERTS_DB=${GTA_UPDATE_ALERTS_DB}"
  echo "OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}"
} >> /etc/environment
set -e

echo 'Starting cron.'
crontab /app/etc/crontab
cron

echo 'Starting server.'
python3 -m flask run --host=0.0.0.0 --port=8080
