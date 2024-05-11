echo 'Setting environment variables.'

{
  echo "TORONTO_ALERTS_EMAIL=${TORONTO_ALERTS_EMAIL}"
  echo "TORONTO_ALERTS_EMAIL_PASSWORD=${TORONTO_ALERTS_EMAIL_PASSWORD}"
  echo "TORONTO_ALERTS_DB=${TORONTO_ALERTS_DB}"
  echo "OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}"
} >> /etc/environment
set -e

echo 'Starting cron.'
crontab /app/etc/crontab
cron

echo 'Starting server.'
python3 -m flask run --host=0.0.0.0 --port=8080
