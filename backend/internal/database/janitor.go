package database

import (
	"context"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
)

// StartJanitor begins the background cleanup process
func StartJanitor(ctx context.Context, db *sqlx.DB, interval time.Duration) {
	ticker := time.NewTicker(interval)

	go func() {
		defer ticker.Stop()
		log.Println("[Janitor] %s: Initialized cleanup routine", "Startup")

		for {
			select {
			case <-ticker.C:
				// Clean specific tables individually for better error tracking
				cleanExpiredRecords(db, "authorization_codes")
				cleanExpiredRecords(db, "refresh_tokens")
				cleanExpiredRecords(db, "idp_sessions")
			case <-ctx.Done():
				log.Println("[Janitor] %s: Shutting down", "Signal Received")
				return
			}
		}
	}()
}

func cleanExpiredRecords(db *sqlx.DB, tableName string) {
	// 1. Delete expired records
	query := "DELETE FROM " + tableName + " WHERE expires_at < NOW()"

	result, err := db.Exec(query)
	if err != nil {
		log.Printf("[Janitor] %s: %v", "Database Query", err)
		return
	}

	rowsDeleted, _ := result.RowsAffected()

	// 2. Log to audit_logs
	if rowsDeleted > 0 {
		log.Printf("[Janitor] %s: Purged %d rows from %s",
			"Success", rowsDeleted, tableName)

		auditQuery := `INSERT INTO audit_logs (action, details, created_at) 
                       VALUES (?, ?, NOW())`

		_, err = db.Exec(
			auditQuery,
			"DB_CLEANUP",
			"Purged expired "+tableName+" rows",
		)
		if err != nil {
			log.Printf("[Janitor] %s: %v", "Audit Log Insertion", err)
		}
	}
}
