# SQL

| Postgres                                                          | MySQL                                                                         |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `brew install postgresql`                                         | `brew install mysql`                                                          |
| `psql -U UNAME`                                                   | `mysql -u UNAME -p`                                                           |
| `psql -U UNAME -h HOST`                                           | `mysql -u UNAME -p -h HOST`                                                   |
| `psql -h <HOST> -U UNAME`                                         | `mysql -h <HOST> -u UNAME --password=PW`                                      |
| `CREATE DATABASE DB_NAME;`                                        | `CREATE DATABASE DB_NAME;`                                                    |
| `\l`                                                              | `SHOW DATABASES;`                                                             |
| `\c DB_NAME`                                                      | `USE DB_NAME;`                                                                |
| `DROP DATABASE DB_NAME;`                                          | `DROP DATABASE DB_NAME;`                                                      |
| `CREATE USER newuser WITH PASSWORD 'password';`                   | `CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';`                 |
| `GRANT ALL PRIVILEGES ON DATABASE dbname TO newuser;`             | `GRANT ALL PRIVILEGES ON dbname.* TO 'newuser'@'localhost';`                  |
| `N/A`                                                             | `FLUSH PRIVILEGES;`                                                           |
| `\du`                                                             | `SHOW GRANTS FOR 'newuser'@'localhost';`                                      |
| `DROP USER newuser;`                                              | `DROP USER 'newuser'@'localhost';`                                            |
| `CREATE TABLE TABLE_NAME (id INT, name TEXT);`                    | `CREATE TABLE TABLE_NAME (id INT, name TEXT);`                                |
| `\dt`                                                             | `SHOW TABLES;`                                                                |
| `\d TABLE_NAME`                                                   | `DESCRIBE TABLE_NAME;`                                                        |
| `ALTER TABLE TABLE_NAME ADD COLUMN age INT;`                      | `ALTER TABLE TABLE_NAME ADD COLUMN age INT;`                                  |
| `DROP TABLE TABLE_NAME;`                                          | `DROP TABLE TABLE_NAME;`                                                      |
| `INSERT INTO TABLE_NAME (id, name, age) VALUES (1, 'Alice', 30);` | `INSERT INTO TABLE_NAME (id, name, age) VALUES (1, 'Alice', 30);`             |
| `SELECT * FROM TABLE_NAME;`                                       | `SELECT * FROM TABLE_NAME;`                                                   |
| `SELECT name FROM TABLE_NAME WHERE CONDITION;`                    | `SELECT name FROM TABLE_NAME WHERE CONDITION;`                                |
| `SELECT COUNT(*) FROM TABLE_NAME;`                                | `SELECT COUNT(*) FROM TABLE_NAME;`                                            |
| `UPDATE TABLE_NAME SET age = 31 WHERE id = 1;`                    | `UPDATE TABLE_NAME SET age = 31 WHERE id = 1;`                                |
| `DELETE FROM TABLE_NAME WHERE CONDITION;`                         | `DELETE FROM TABLE_NAME WHERE CONDITION;`                                     |
| `TRUNCATE TABLE TABLE_NAME;`                                      | `TRUNCATE TABLE TABLE_NAME;`                                                  |
| `pg_dump -s -h <HOST> -U UNAME dbname > structure.sql`            | `mysqldump -h <HOST> -u UNAME --no-data dbname > structure.sql --password=PW` |
| `pg_dump -U UNAME dbname > backup.sql`                            | `mysqldump -u UNAME -p dbname > backup.sql`                                   |
| `psql -U UNAME dbname < backup.sql`                               | `mysql -u UNAME -p dbname < backup.sql`                                       |
| `\q`                                                              | `EXIT;`                                                                       |
