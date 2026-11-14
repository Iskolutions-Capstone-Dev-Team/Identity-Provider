package mocks

import (
	"context"
	"reflect"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	gomock "go.uber.org/mock/gomock"
)

type MockRetentionRepository struct {
	ctrl     *gomock.Controller
	recorder *MockRetentionRepositoryMockRecorder
}

type MockRetentionRepositoryMockRecorder struct {
	mock *MockRetentionRepository
}

func NewMockRetentionRepository(ctrl *gomock.Controller) *MockRetentionRepository {
	mock := &MockRetentionRepository{ctrl: ctrl}
	mock.recorder = &MockRetentionRepositoryMockRecorder{mock}
	return mock
}

func (m *MockRetentionRepository) EXPECT() *MockRetentionRepositoryMockRecorder {
	return m.recorder
}

func (m *MockRetentionRepository) StreamLogsOlderThan(
	ctx context.Context,
	tableName string,
	cutoff time.Time,
	fn func(entry models.AuditLog) error,
) (int64, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "StreamLogsOlderThan", ctx, tableName, cutoff, fn)
	ret0, _ := ret[0].(int64)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockRetentionRepositoryMockRecorder) StreamLogsOlderThan(
	ctx, tableName, cutoff, fn any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"StreamLogsOlderThan",
		reflect.TypeOf((*MockRetentionRepository)(nil).StreamLogsOlderThan),
		ctx, tableName, cutoff, fn,
	)
}

func (m *MockRetentionRepository) BatchDeleteLogsOlderThan(
	ctx context.Context,
	tableName string,
	cutoff time.Time,
	batchSize int,
) (int64, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "BatchDeleteLogsOlderThan", ctx, tableName, cutoff, batchSize)
	ret0, _ := ret[0].(int64)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockRetentionRepositoryMockRecorder) BatchDeleteLogsOlderThan(
	ctx, tableName, cutoff, batchSize any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"BatchDeleteLogsOlderThan",
		reflect.TypeOf((*MockRetentionRepository)(nil).BatchDeleteLogsOlderThan),
		ctx, tableName, cutoff, batchSize,
	)
}

func (m *MockRetentionRepository) GetOldestLogTimestamp(
	ctx context.Context,
	tableName string,
) (*time.Time, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetOldestLogTimestamp", ctx, tableName)
	ret0, _ := ret[0].(*time.Time)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockRetentionRepositoryMockRecorder) GetOldestLogTimestamp(
	ctx, tableName any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"GetOldestLogTimestamp",
		reflect.TypeOf((*MockRetentionRepository)(nil).GetOldestLogTimestamp),
		ctx, tableName,
	)
}

