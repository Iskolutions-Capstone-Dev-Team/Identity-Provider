package service

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
)

type RetentionService interface {
	ExecuteRetention(ctx context.Context) (*dto.RetentionRunResponse, error)
}

type retentionService struct {
	retentionRepo repository.RetentionRepository
	logRepo       repository.LogRepository
	storage       *storage.S3Provider
}

func NewRetentionService(
	retentionRepo repository.RetentionRepository,
	logRepo repository.LogRepository,
	storageProvider *storage.S3Provider,
) RetentionService {
	return &retentionService{
		retentionRepo: retentionRepo,
		logRepo:       logRepo,
		storage:       storageProvider,
	}
}

func (s *retentionService) archiveAndPurgeTable(
	ctx context.Context,
	tableName string,
	logType string,
	cutoff time.Time,
	bucket string,
) (int64, int64, string, error) {
	var buf bytes.Buffer
	gzWriter := gzip.NewWriter(&buf)
	csvWriter := csv.NewWriter(gzWriter)

	// Write CSV headers
	header := []string{"id", "actor", "action", "target", "metadata", "status", "created_at"}
	if err := csvWriter.Write(header); err != nil {
		return 0, 0, "", fmt.Errorf("[%s] Write CSV Header: %w", tableName, err)
	}

	var rowCount int64
	_, err := s.retentionRepo.StreamLogsOlderThan(
		ctx,
		tableName,
		cutoff,
		func(entry models.AuditLog) error {
			rowCount++
			actor := ""
			if entry.Actor != nil {
				actor = *entry.Actor
			}
			record := []string{
				strconv.FormatInt(entry.ID, 10),
				actor,
				entry.Action,
				entry.Target,
				string(entry.Metadata),
				entry.Status,
				entry.CreatedAt.UTC().Format(time.RFC3339),
			}
			return csvWriter.Write(record)
		},
	)
	if err != nil {
		return 0, 0, "", fmt.Errorf("[%s] Stream Logs: %w", tableName, err)
	}

	csvWriter.Flush()
	if err := csvWriter.Error(); err != nil {
		return 0, 0, "", fmt.Errorf("[%s] CSV Flush: %w", tableName, err)
	}

	if err := gzWriter.Close(); err != nil {
		return 0, 0, "", fmt.Errorf("[%s] Gzip Close: %w", tableName, err)
	}

	if rowCount == 0 {
		return 0, 0, "", nil
	}

	archiveFile := fmt.Sprintf(
		"log-archives/%s/%04d/%02d/%s_%s.csv.gz",
		logType,
		cutoff.Year(),
		cutoff.Month(),
		tableName,
		time.Now().UTC().Format("20060102_150405"),
	)

	// Upload to S3/MinIO
	if s.storage != nil {
		payload := buf.Bytes()
		err = s.storage.UploadToBucket(
			ctx,
			bucket,
			archiveFile,
			bytes.NewReader(payload),
			int64(len(payload)),
			"application/gzip",
		)
		if err != nil {
			return 0, 0, "", fmt.Errorf("[%s] S3 Upload: %w", tableName, err)
		}
	} else {
		log.Printf("[RetentionService] WARNING: S3 storage provider is nil; skipping archive upload for %s", tableName)
	}

	// Safely purge from MySQL in batches of 1000
	purged, err := s.retentionRepo.BatchDeleteLogsOlderThan(ctx, tableName, cutoff, 1000)
	if err != nil {
		return rowCount, purged, archiveFile, fmt.Errorf("[%s] Batch Purge: %w", tableName, err)
	}

	return rowCount, purged, archiveFile, nil
}

func (s *retentionService) ExecuteRetention(ctx context.Context) (*dto.RetentionRunResponse, error) {
	start := time.Now()
	// Cutoff is 1 year and 1 month ago (13 months)
	cutoff := time.Now().UTC().AddDate(-1, -1, 0)
	cutoffStr := cutoff.Format("2006-01-02")

	bucket := os.Getenv("BACKUP_S3_BUCKET")
	if bucket == "" && s.storage != nil {
		bucket = s.storage.BucketName
	}

	var archiveFiles []string

	// 1. Process audit_logs
	auditArchived, auditPurged, auditArchive, err := s.archiveAndPurgeTable(
		ctx, "audit_logs", "audit", cutoff, bucket,
	)
	if err != nil {
		log.Printf("[RetentionService] Error processing audit_logs: %v", err)
		return nil, err
	}
	if auditArchive != "" {
		archiveFiles = append(archiveFiles, auditArchive)
	}

	// 2. Process security_logs
	secArchived, secPurged, secArchive, err := s.archiveAndPurgeTable(
		ctx, "security_logs", "security", cutoff, bucket,
	)
	if err != nil {
		log.Printf("[RetentionService] Error processing security_logs: %v", err)
		return nil, err
	}
	if secArchive != "" {
		archiveFiles = append(archiveFiles, secArchive)
	}

	duration := time.Since(start).String()

	resp := &dto.RetentionRunResponse{
		Status:               "completed",
		CutoffDate:           cutoffStr,
		AuditLogsArchived:    auditArchived,
		AuditLogsPurged:      auditPurged,
		SecurityLogsArchived: secArchived,
		SecurityLogsPurged:   secPurged,
		ArchiveFiles:         archiveFiles,
		Duration:             duration,
	}

	// Record audit log entry for this retention execution
	if s.logRepo != nil {
		actor := "system/retention-worker"
		metaBytes, _ := json.Marshal(resp)
		_ = s.logRepo.CreateLog(ctx, &models.AuditLog{
			Actor:     &actor,
			Action:    "log_retention_purge",
			Target:    "logs",
			Status:    models.StatusSuccess,
			Metadata:  metaBytes,
			CreatedAt: time.Now().UTC(),
		})
	}

	log.Printf(
		"[RetentionService] Retention executed: %d audit purged, %d security purged in %s",
		auditPurged, secPurged, duration,
	)

	return resp, nil
}

