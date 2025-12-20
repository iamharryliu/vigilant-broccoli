# MySQL

```
brew install mysql

mysql -u username -p
mysql -u username -p -h host  # Connect to a remote MySQL server

mysql -h <HOST> -u <USERNAME> --password=<PASSWORD>
mysqldump -h <HOST> -u <USERNAME> --no-data <DATABASE_NAME> > structure.sql --password=<PASSWORD>

CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON dbname.* TO 'newuser'@'localhost';
FLUSH PRIVILEGES;  -- Apply changes
SHOW GRANTS FOR 'newuser'@'localhost';
DROP USER 'newuser'@'localhost';

\c

EXIT;

SHOW DATABASES;
CREATE DATABASE DB_NAME;
USE DB_NAME;
DROP DATABASE DB_NAME;

SHOW TABLES;
DESCRIBE TABLE_NAME;
CREATE TABLE TABLE_NAME (id INT, name TEXT);
DROP TABLE TABLE_NAME;
ALTER TABLE TABLE_NAME ADD COLUMN age INT;

INSERT INTO TABLE_NAME (id, name, age) VALUES (1, 'Alice', 30);

SELECT * FROM TABLE_NAME;
SELECT name FROM TABLE_NAME WHERE age > 25;
SELECT COUNT(*) FROM TABLE_NAME;

UPDATE TABLE_NAME SET age = 31 WHERE id = 1;

DELETE FROM TABLE_NAME WHERE;
DELETE FROM TABLE_NAME WHERE CONDITION;
TRUNCATE TABLE TABLE_NAME;

mysqldump -u username -p dbname > backup.sql
mysql -u username -p dbname < backup.sql
```
