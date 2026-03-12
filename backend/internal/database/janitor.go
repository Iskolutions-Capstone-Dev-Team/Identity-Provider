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
		log.Printf("[Janitor] %s: Initialized cleanup routine", "Startup")

		for {
			select {
			case <-ticker.C:
				// Clean specific tables individually for better error tracking
				cleanExpiredRecords(db, "authorization_codes")
				cleanExpiredRecords(db, "refresh_tokens")
				cleanExpiredRecords(db, "idp_sessions")
			case <-ctx.Done():
				log.Printf("[Janitor] %s: Shutting down", "Signal Received")
				return
			}
		}
	}()
}

func cleanExpiredRecords(db *sqlx.DB, tableName string) {
	// 1. Delete expired records
	query := "DELETE FROM " + tableName + " WHERE expires_at < NOW()"

	_, err := db.Exec(query)
	if err != nil {
		log.Printf("[Janitor] %s: %v", "Database Query", err)
		return
	}

}
