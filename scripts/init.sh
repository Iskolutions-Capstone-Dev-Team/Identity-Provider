#!/bin/bash
set -e

mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
    -- 1. Create and Configure Admin User
    CREATE USER IF NOT EXISTS '${ADMIN_SQL_USER}'@'%' 
    IDENTIFIED BY '${ADMIN_SQL_PASSWORD}';

    GRANT ALL PRIVILEGES ON *.* TO '${ADMIN_SQL_USER}'@'%' WITH GRANT OPTION;
    
    -- 2. Create and Configure Application Service User
    CREATE USER IF NOT EXISTS '${APP_USER}'@'%' 
    IDENTIFIED BY '${APP_PASSWORD}';

    -- General permissions for the IdP Backend
    GRANT SELECT, INSERT, UPDATE, EXECUTE ON \`${MYSQL_DB_NAME}\`.* TO '${APP_USER}'@'%';

    FLUSH PRIVILEGES;
EOSQL

echo "[Database Init] Users '${ADMIN_SQL_USER}' and '${APP_USER}' configured."