package service

import (
	"encoding/json"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/google/uuid"
)

type LogService struct {
	Repo *repository.LogRepository
}

// PostAuditLog handles logic for creating an audit log.
func (s *LogService) PostAuditLog(actorID []byte,
	req *dto.PostAuditLogRequest,
) error {
	actorName := s.resolveActor(actorID)

	log := &models.AuditLog{
		Actor:    &actorName,
		Action:   req.Action,
		Target:   req.Target,
		Status:   req.Status,
		Metadata: req.Metadata,
	}

	return s.Repo.CreateLog(log)
}

// GetLog retrieves a single audit log based on DTO filters.
func (s *LogService) GetLog(req *dto.GetAuditLogRequest) (
	*dto.PostAuditLogRequest, error,
) {
	res, err := s.Repo.GetLog(req.Actor, req.Status)
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
func (s *LogService) GetLogList(limit, offset int) (
	[]dto.PostAuditLogRequest, error,
) {
	logs, err := s.Repo.GetLogList(limit, offset)
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
func (s *LogService) resolveActor(id []byte) string {
	if email, err := s.Repo.GetUserEmailbyID(id); err == nil && email != "" {
		return email
	}

	if name, err := s.Repo.GetClientNameByID(id); err == nil && name != "" {
		return name
	}

	return fmt.Sprintf("ID:%x", id)
}

// PostAuditLogWithActorString creates an audit log with the actor as a direct string.
func (s *LogService) PostAuditLogWithActorString(actor string, req *dto.PostAuditLogRequest) error {
	log := &models.AuditLog{
		Actor:    &actor,
		Action:   req.Action,
		Target:   req.Target,
		Status:   req.Status,
		Metadata: req.Metadata,
	}
	return s.Repo.CreateLog(log)
}

// ResolveClientName returns a human-readable client name from a client ID string.
// If the ID is not a valid UUID or the lookup fails, it returns the original ID.
func (s *LogService) ResolveClientName(clientID string) string {
	idBytes, err := uuid.Parse(clientID)
	if err != nil {
		// Not a UUID – assume it's already a name or URL
		return clientID
	}
	name, err := s.Repo.GetClientNameByID(idBytes[:])
	if err != nil || name == "" {
		return clientID
	}
	return name
}

// GetUserEmail returns the email for a user ID (as []byte).
// If lookup fails, it returns an empty string.
func (s *LogService) GetUserEmail(userID []byte) (string, error) {
	return s.Repo.GetUserEmailbyID(userID)
}

// GetLogByID retrieves a single audit log by its ID and converts it to DTO.
func (s *LogService) GetLogByID(id int64) (*dto.PostAuditLogRequest, error) {
	log, err := s.Repo.GetLogByID(id)
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

// GetLogListWithFilters retrieves a paginated list of logs matching the filters.
// It returns the list and total count.
func (s *LogService) GetLogListWithFilters(
	filters map[string]interface{},
	limit, page int,
) ([]dto.PostAuditLogRequest, int64, int, error) {
	if limit <= 0 {
		limit = 10
	}
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	logs, total, err := s.Repo.GetLogListWithFilters(filters, limit, offset)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("[LogService] GetLogListWithFilters: %w", err)
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

	lastPage := int((total + int64(limit) - 1) / int64(limit))
	return dtos, total, lastPage, nil
}