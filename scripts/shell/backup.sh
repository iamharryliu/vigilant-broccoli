#!/bin/bash
# TODO: work on this later
# Database credentials
DB_NAME="your_database_name"
DB_USER="your_database_user"
DB_PASS="your_database_password"
DB_HOST="your_database_host"
DB_PORT="your_database_port"

# Backup directory
BACKUP_DIR="/path/to/your/backup/directory"

# Date format for backup file name
DATE=$(date +"\%Y-\%m-\%d")

# Backup file name
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$DATE.sql"

# Export PGPASSWORD environment variable
export PGPASSWORD=$DB_PASS

# Perform the backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_FILE

# Unset the PGPASSWORD environment variable
unset PGPASSWORD

# Optional: Remove backups older than 7 days
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -exec rm {} \;

# Print completion message
echo "Backup completed: $BACKUP_FILE"




chmod +x /path/to/your/backup_script.sh


crontab -e

0 2 * * * /path/to/your/backup_script.sh
