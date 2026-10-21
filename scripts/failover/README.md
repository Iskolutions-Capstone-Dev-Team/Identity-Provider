# Automated Failover System: Identity Provider & One Portal

This directory contains the automated failover infrastructure connecting the Primary and Fallback servers for the Identity Provider and One Portal services.

---

## Directory Overview

- `spaceship-dns-switch.sh`: Automates updating the domain's A-records using the Spaceship REST API.
- `promote-to-primary.sh`: Promotes the standby MySQL databases to read-write mode (`SET GLOBAL read_only = OFF; STOP REPLICA;`).
- `failover-daemon.sh`: Background watcher daemon that monitors Primary HTTP health and triggers cutover upon sustained failure.
- `mysql-replica-setup.sh`: Configures the fallback databases as read-only replicas of the primary server.
- `failover-watcher.service`: Systemd service unit to run the watcher daemon on the Fallback host.

---

## Configuration Variables (`.env`)

Add the following variables to `.env` on both Primary and Fallback hosts:

```bash
# --- AUTOMATED FAILOVER CONFIGURATION ---
PRIMARY_IP="<primary_server_public_or_internal_ip>"
FALLBACK_IP="<fallback_server_public_ip>"

# Primary Health Endpoints
PRIMARY_IDP_HEALTH_URL="http://${PRIMARY_IP}:8080/health"
PRIMARY_PORTAL_HEALTH_URL="http://${PRIMARY_IP}:8000/health"

# Spaceship DNS API Credentials
SPACESHIP_API_KEY="<your_spaceship_api_key>"
SPACESHIP_API_SECRET="<your_spaceship_api_secret>"
FAILOVER_DOMAIN="yourdomain.com"
IDP_SUBDOMAIN="@"
PORTAL_SUBDOMAIN="portal"
DNS_TTL=60

# Failover Detection Timing
FAILOVER_CHECK_INTERVAL=15
FAILOVER_FAILURE_THRESHOLD=3
FAILOVER_PROBE_TIMEOUT=5
FAILOVER_LOCK_FILE="/var/run/failover_triggered.lock"

# Replication Settings
REPL_USER="repl"
REPL_PASSWORD="<strong_replication_password>"

# Optional Webhook Alerts (Discord, Slack, etc.)
ALERT_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

---

## Setup Steps

### 1. Primary Server Setup

1. Enable GTID in MySQL (`docker-compose.yml` or `/etc/mysql/my.cnf`):
   ```ini
   [mysqld]
   server-id = 1
   log-bin = mysql-bin
   binlog_format = ROW
   gtid_mode = ON
   enforce_gtid_consistency = ON
   ```

2. Create replication user on Primary databases:
   ```sql
   CREATE USER 'repl'@'%' IDENTIFIED BY '<strong_replication_password>';
   GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'repl'@'%';
   FLUSH PRIVILEGES;
   ```

3. Ensure ports `3360` (IdP) and `3361` (Portal) are accessible from `FALLBACK_IP` through your firewall/security groups.

---

### 2. Fallback Server Setup

1. Enable GTID and Read-Only on Fallback MySQL:
   ```ini
   [mysqld]
   server-id = 2
   gtid_mode = ON
   enforce_gtid_consistency = ON
   read_only = ON
   super_read_only = ON
   ```

2. Run initial replica configuration:
   ```bash
   chmod +x scripts/failover/*.sh
   ./scripts/failover/mysql-replica-setup.sh
   ```

3. Install and start the systemd watcher service:
   ```bash
   # Dynamically generate the service unit using current project path
   sudo bash -c "cat << EOF > /etc/systemd/system/failover-watcher.service
[Unit]
Description=Failover Watcher Daemon for Identity Provider
After=docker.service network-online.target
Requires=docker.service network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=$(pwd)/scripts/failover
ExecStart=/bin/bash $(pwd)/scripts/failover/failover-daemon.sh
Restart=on-failure
RestartSec=15
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF"

   sudo systemctl daemon-reload
   sudo systemctl enable --now failover-watcher.service
   sudo systemctl status failover-watcher.service
   ```

---

## Testing & Dry Run

### Test Spaceship DNS Update
```bash
./scripts/failover/spaceship-dns-switch.sh "${FALLBACK_IP}"
```
Verify the records in the Spaceship dashboard or via `nslookup staging.identity-provider.isaxbsit2027.com 8.8.8.8`. The script automatically cleans up stale A-records so only the target IP remains.

### Test Database Promotion
```bash
./scripts/failover/promote-to-primary.sh
```

---

## Failback Procedure (Cold Restore via mysqldump)

Once the original Primary server (`18.139.100.204`) is healthy and ready to resume:

### 1. Dump latest database state from Fallback (`47.131.150.226`)
```bash
# Export the active database from the fallback container
docker exec unified_access_database mysqldump -uroot -p"$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)" \
  --single-transaction --quick --routines --triggers --databases unified_access > /tmp/failover_recovery.sql
```

### 2. Transfer and restore dump into Primary (`18.139.100.204`)
```bash
# Copy dump to Primary host (via scp)
scp /tmp/failover_recovery.sql ubuntu@18.139.100.204:/tmp/

# On Primary: Restore into unified_access_database
docker exec -i unified_access_database mysql -uroot -p"$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)" unified_access < /tmp/failover_recovery.sql
```

### 3. Switch Spaceship DNS back to Primary
Run on either machine or local terminal with credentials:
```bash
./scripts/failover/spaceship-dns-switch.sh 18.139.100.204
```
*(The script will automatically detect and delete `47.131.150.226` from Spaceship, leaving only `18.139.100.204`)*.

### 4. Reset Fallback back to Standby Mode (On `47.131.150.226`)
```bash
# Put database back in read-only mode
docker exec -i unified_access_database mysql -uroot -p"$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)" \
  -e "SET GLOBAL read_only = ON; SET GLOBAL super_read_only = ON;"

# Remove the failover lock file
sudo rm -f /var/run/failover_triggered.lock

# Restart the watcher service to re-arm monitoring
sudo systemctl restart failover-watcher.service
```
