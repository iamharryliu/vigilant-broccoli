set -e

mkdir -p /app/var/log
crontab /app/etc/crontab
cron

python3 -m flask run --host=0.0.0.0 --port=8080
