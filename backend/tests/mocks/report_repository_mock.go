package mocks

import (
	"context"
	"reflect"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	gomock "go.uber.org/mock/gomock"
)

type MockReportRepository struct {
	ctrl     *gomock.Controller
	recorder *MockReportRepositoryMockRecorder
}

type MockReportRepositoryMockRecorder struct {
	mock *MockReportRepository
}

func NewMockReportRepository(ctrl *gomock.Controller) *MockReportRepository {
	mock := &MockReportRepository{ctrl: ctrl}
	mock.recorder = &MockReportRepositoryMockRecorder{mock}
	return mock
}

func (m *MockReportRepository) EXPECT() *MockReportRepositoryMockRecorder {
	return m.recorder
}

func (m *MockReportRepository) GetAggregatedKPIs(
	ctx context.Context,
	from, to time.Time,
	logType string,
) (*dto.AnalyticsKPISummary, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetAggregatedKPIs", ctx, from, to, logType)
	ret0, _ := ret[0].(*dto.AnalyticsKPISummary)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockReportRepositoryMockRecorder) GetAggregatedKPIs(
	ctx, from, to, logType any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"GetAggregatedKPIs",
		reflect.TypeOf((*MockReportRepository)(nil).GetAggregatedKPIs),
		ctx, from, to, logType,
	)
}

func (m *MockReportRepository) GetTimeseries(
	ctx context.Context,
	from, to time.Time,
	interval string,
	logType string,
) ([]dto.TimeseriesPoint, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetTimeseries", ctx, from, to, interval, logType)
	ret0, _ := ret[0].([]dto.TimeseriesPoint)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockReportRepositoryMockRecorder) GetTimeseries(
	ctx, from, to, interval, logType any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"GetTimeseries",
		reflect.TypeOf((*MockReportRepository)(nil).GetTimeseries),
		ctx, from, to, interval, logType,
	)
}

func (m *MockReportRepository) StreamLogs(
	ctx context.Context,
	from, to time.Time,
	logType string,
	fn func(entry models.AuditLog, entryType string) error,
) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "StreamLogs", ctx, from, to, logType, fn)
	ret0, _ := ret[0].(error)
	return ret0
}

func (mr *MockReportRepositoryMockRecorder) StreamLogs(
	ctx, from, to, logType, fn any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"StreamLogs",
		reflect.TypeOf((*MockReportRepository)(nil).StreamLogs),
		ctx, from, to, logType, fn,
	)
}

