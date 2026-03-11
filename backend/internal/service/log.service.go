package service

import (
	"encoding/json"
	"fmt"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
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
