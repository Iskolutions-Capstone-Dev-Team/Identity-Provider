package initializers

import (
	"context"
	"log"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
)

// next0800UTC calculates the duration from now until the next 08:00 UTC.
func next0800UTC(now time.Time) time.Duration {
	nowUTC := now.UTC()
	target := time.Date(nowUTC.Year(), nowUTC.Month(), nowUTC.Day(), 8, 0, 0, 0, time.UTC)
	if !target.After(nowUTC) {
		target = target.AddDate(0, 0, 1)
	}
	return target.Sub(nowUTC)
}

// StartRetentionWorker launches a background goroutine that executes
// log retention daily at 08:00 UTC until ctx is cancelled.
func StartRetentionWorker(ctx context.Context, retentionSvc service.RetentionService) {
	if retentionSvc == nil {
		log.Println("[RetentionWorker] Skipping: retention service is nil")
		return
	}

	go func() {
		log.Println("[RetentionWorker] Initializing daily log retention worker (08:00 UTC schedule)")
		for {
			delay := next0800UTC(time.Now())
			log.Printf(
				"[RetentionWorker] Next retention scheduled in %s (at %s)",
				delay.Round(time.Second),
				time.Now().UTC().Add(delay).Format(time.RFC3339),
			)

			select {
			case <-ctx.Done():
				log.Println("[RetentionWorker] Worker stopped gracefully")
				return
			case <-time.After(delay):
				log.Println("[RetentionWorker] Executing scheduled daily log retention (13-month horizon)...")
				if _, err := retentionSvc.ExecuteRetention(ctx); err != nil {
					log.Printf("[RetentionWorker] Scheduled retention execution failed: %v", err)
				}
			}
		}
	}()
}

