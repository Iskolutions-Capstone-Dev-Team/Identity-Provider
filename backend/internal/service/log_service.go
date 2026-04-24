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

type LogService interface {
	PostAuditLog(ctx context.Context, actorID []byte,
		req *dto.PostAuditLogRequest) error
	GetLog(ctx context.Context, req *dto.GetAuditLogRequest,
	) (*dto.PostAuditLogRequest, error)
	GetLogList(ctx context.Context, limit,
		offset int) ([]dto.PostAuditLogRequest, error)
	PostAuditLogWithActorString(ctx context.Context, actor string,
		req *dto.PostAuditLogRequest) error
	ResolveClientName(ctx context.Context, clientID string) string
	GetUserEmail(ctx context.Context, userID []byte) (string, error)
	GetLogByID(ctx context.Context, id int64) (*dto.PostAuditLogRequest, error)
	GetLogListWithFilters(ctx context.Context, filters map[string]interface{},
		limit, page int) ([]dto.PostAuditLogRequest, int64, int, error)

	PostSecurityLog(ctx context.Context, actorID []byte,
		req *dto.PostAuditLogRequest) error
	PostSecurityLogWithActorString(ctx context.Context, actor string,
		req *dto.PostAuditLogRequest) error
	GetSecurityLog(ctx context.Context, req *dto.GetAuditLogRequest,
	) (*dto.PostAuditLogRequest, error)
	GetSecurityLogByID(ctx context.Context,
		id int64) (*dto.PostAuditLogRequest, error)
	GetSecurityLogListWithFilters(ctx context.Context,
		filters map[string]interface{}, limit, page int,
	) ([]dto.PostAuditLogRequest, int64, int, error)
}

type logService struct {
	Repo    repository.LogRepository
	logChan chan *logTask
}

type logTask struct {
	actorID    []byte
	actorStr   string
	isStr      bool
	isSecurity bool
	request    *dto.PostAuditLogRequest
}

func NewLogService(repo repository.LogRepository) LogService {
	s := &logService{
		Repo:    repo,
		logChan: make(chan *logTask, 100),
	}
	go s.processLogs()
	return s
}

// PostAuditLog handles logic for creating an audit log.
func (s *logService) PostAuditLog(ctx context.Context, actorID []byte,
	req *dto.PostAuditLogRequest,
) error {
	s.logChan <- &logTask{
		actorID: actorID,
		request: req,
	}
	return nil
}

// PostSecurityLog handles logic for creating a security log.
func (s *logService) PostSecurityLog(ctx context.Context, actorID []byte,
	req *dto.PostAuditLogRequest,
) error {
	s.logChan <- &logTask{
		actorID:    actorID,
		request:    req,
		isSecurity: true,
	}
	return nil
}

// GetLog retrieves a single audit log based on DTO filters.
func (s *logService) GetLog(ctx context.Context,
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

// GetSecurityLog retrieves a single security log based on DTO filters.
func (s *logService) GetSecurityLog(ctx context.Context,
	req *dto.GetAuditLogRequest,
) (*dto.PostAuditLogRequest, error) {
	res, err := s.Repo.GetSecurityLog(ctx, req.Actor, req.Status)
	if err != nil {
		return nil, fmt.Errorf("[LogService] GetSecurityLog: %w", err)
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
func (s *logService) GetLogList(ctx context.Context,
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
func (s *logService) resolveActor(ctx context.Context, id []byte) string {
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
func (s *logService) PostAuditLogWithActorString(ctx context.Context,
	actor string, req *dto.PostAuditLogRequest,
) error {
	s.logChan <- &logTask{
		actorStr: actor,
		request:  req,
		isStr:    true,
	}
	return nil
}

// PostSecurityLogWithActorString creates a security log with string actor.
func (s *logService) PostSecurityLogWithActorString(ctx context.Context,
	actor string, req *dto.PostAuditLogRequest,
) error {
	s.logChan <- &logTask{
		actorStr:   actor,
		request:    req,
		isStr:      true,
		isSecurity: true,
	}
	return nil
}

func (s *logService) processLogs() {
	for task := range s.logChan {
		var actorName string
		if task.isStr {
			actorName = task.actorStr
		} else {
			actorName = s.resolveActor(
				context.Background(),
				task.actorID,
			)
		}

		log := &models.AuditLog{
			Actor:    &actorName,
			Action:   task.request.Action,
			Target:   task.request.Target,
			Status:   task.request.Status,
			Metadata: task.request.Metadata,
		}

		if task.isSecurity {
			_ = s.Repo.CreateSecurityLog(context.Background(), log)
		} else {
			_ = s.Repo.CreateLog(context.Background(), log)
		}
	}
}

// ResolveClientName returns a human-readable client name.
func (s *logService) ResolveClientName(ctx context.Context,
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
func (s *logService) GetUserEmail(ctx context.Context,
	userID []byte,
) (string, error) {
	return s.Repo.GetUserEmailbyID(ctx, userID)
}

// GetLogByID retrieves a single audit log by its ID.
func (s *logService) GetLogByID(ctx context.Context,
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

// GetSecurityLogByID retrieves a single security log by its ID.
func (s *logService) GetSecurityLogByID(ctx context.Context,
	id int64,
) (*dto.PostAuditLogRequest, error) {
	log, err := s.Repo.GetSecurityLogByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("[LogService] GetSecurityLogByID: %w", err)
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
func (s *logService) GetLogListWithFilters(ctx context.Context,
	filters map[string]interface{}, limit, page int,
) ([]dto.PostAuditLogRequest, int64, int, error) {
	if limit <= 0 {
		limit = 10
	}
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	logs, total, err := s.Repo.GetLogListWithFilters(
		ctx, filters, limit, offset,
	)
	if err != nil {
		return nil, 0, 0, fmt.Errorf(
			"[LogService] GetLogListWithFilters: %w", err,
		)
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

// GetSecurityLogListWithFilters retrieves security logs matching filters.
func (s *logService) GetSecurityLogListWithFilters(ctx context.Context,
	filters map[string]interface{}, limit, page int,
) ([]dto.PostAuditLogRequest, int64, int, error) {
	if limit <= 0 {
		limit = 10
	}
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	logs, total, err := s.Repo.GetSecurityLogListWithFilters(
		ctx, filters, limit, offset,
	)
	if err != nil {
		return nil, 0, 0, fmt.Errorf(
			"[LogService] GetSecurityLogListWithFilters: %w", err,
		)
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
