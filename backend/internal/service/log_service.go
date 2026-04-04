package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/google/uuid"
)

type LogService struct {
	Repo repository.LogRepository
}

// PostAuditLog handles logic for creating an audit log.
func (s *LogService) PostAuditLog(ctx context.Context, actorID []byte,
	req *dto.PostAuditLogRequest,
) error {
	actorName := s.resolveActor(ctx, actorID)

	log := &models.AuditLog{
		Actor:    &actorName,
		Action:   req.Action,
		Target:   req.Target,
		Status:   req.Status,
		Metadata: req.Metadata,
	}

	return s.Repo.CreateLog(ctx, log)
}

// GetLog retrieves a single audit log based on DTO filters.
func (s *LogService) GetLog(ctx context.Context,
	req *dto.GetAuditLogRequest,
) (*dto.PostAuditLogRequest, error) {
	res, err := s.Repo.GetLog(ctx, req.Actor, req.Status)
	if err != nil {
		return nil, fmt.Errorf("[LogService] GetLog: %w", err)
	}

	return &dto.PostAuditLogRequest{
		Actor:    res.Actor,
		Action:   res.Action,
		Target:   res.Target,
		Status:   res.Status,
		Metadata: json.RawMessage(res.Metadata),
	}, nil
}

// GetLogList retrieves a list of audit logs converted to DTOs.
func (s *LogService) GetLogList(ctx context.Context,
	limit, offset int,
) ([]dto.PostAuditLogRequest, error) {
	logs, err := s.Repo.GetLogList(ctx, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("[LogService] GetLogList: %w", err)
	}

	dtos := make([]dto.PostAuditLogRequest, len(logs))
	for i, log := range logs {
		dtos[i] = dto.PostAuditLogRequest{
			Actor:    log.Actor,
			Action:   log.Action,
			Target:   log.Target,
			Status:   log.Status,
			Metadata: json.RawMessage(log.Metadata),
		}
	}

	return dtos, nil
}

// resolveActor attempts to find the actor name from users or clients.
func (s *LogService) resolveActor(ctx context.Context, id []byte) string {
	if email, err := s.Repo.GetUserEmailbyID(ctx, id); err == nil &&
		email != "" {
		return email
	}

	if name, err := s.Repo.GetClientNameByID(ctx, id); err == nil &&
		name != "" {
		return name
	}

	return fmt.Sprintf("ID:%x", id)
}

// PostAuditLogWithActorString creates an audit log with string actor.
func (s *LogService) PostAuditLogWithActorString(ctx context.Context,
	actor string, req *dto.PostAuditLogRequest,
) error {
	log := &models.AuditLog{
		Actor:    &actor,
		Action:   req.Action,
		Target:   req.Target,
		Status:   req.Status,
		Metadata: req.Metadata,
	}
	return s.Repo.CreateLog(ctx, log)
}

// ResolveClientName returns a human-readable client name.
func (s *LogService) ResolveClientName(ctx context.Context,
	clientID string,
) string {
	idBytes, err := uuid.Parse(clientID)
	if err != nil {
		return clientID
	}
	name, err := s.Repo.GetClientNameByID(ctx, idBytes[:])
	if err != nil || name == "" {
		return clientID
	}
	return name
}

// GetUserEmail returns the email for a user ID.
func (s *LogService) GetUserEmail(ctx context.Context,
	userID []byte,
) (string, error) {
	return s.Repo.GetUserEmailbyID(ctx, userID)
}

// GetLogByID retrieves a single audit log by its ID.
func (s *LogService) GetLogByID(ctx context.Context,
	id int64,
) (*dto.PostAuditLogRequest, error) {
	log, err := s.Repo.GetLogByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("[LogService] GetLogByID: %w", err)
	}
	return &dto.PostAuditLogRequest{
		Actor:    log.Actor,
		Action:   log.Action,
		Target:   log.Target,
		Status:   log.Status,
		Metadata: json.RawMessage(log.Metadata),
	}, nil
}

// GetLogListWithFilters retrieves logs matching filters.
func (s *LogService) GetLogListWithFilters(ctx context.Context,
	filters map[string]interface{}, limit, page int,
) ([]dto.PostAuditLogRequest, int64, int, error) {
	if limit <= 0 {
		limit = 10
	}
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	logs, total, err := s.Repo.GetLogListWithFilters(ctx, filters, limit, offset)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("[LogService] GetLogListWithFilters: %w", err)
	}

	dtos := make([]dto.PostAuditLogRequest, len(logs))
	for i, log := range logs {
		dtos[i] = dto.PostAuditLogRequest{
			Actor:     log.Actor,
			Action:    log.Action,
			Target:    log.Target,
			Status:    log.Status,
			Metadata:  json.RawMessage(log.Metadata),
			CreatedAt: log.CreatedAt,
		}
	}

	lastPage := int((total + int64(limit) - 1) / int64(limit))
	return dtos, total, lastPage, nil
}
