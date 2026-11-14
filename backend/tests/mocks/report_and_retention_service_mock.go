package mocks

import (
	"context"
	"io"
	"reflect"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/google/uuid"
	gomock "go.uber.org/mock/gomock"
)

type MockReportService struct {
	ctrl     *gomock.Controller
	recorder *MockReportServiceMockRecorder
}

type MockReportServiceMockRecorder struct {
	mock *MockReportService
}

func NewMockReportService(ctrl *gomock.Controller) *MockReportService {
	mock := &MockReportService{ctrl: ctrl}
	mock.recorder = &MockReportServiceMockRecorder{mock}
	return mock
}

func (m *MockReportService) EXPECT() *MockReportServiceMockRecorder {
	return m.recorder
}

func (m *MockReportService) GenerateSystemReport(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
	params dto.SystemReportParams,
) ([]byte, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GenerateSystemReport", ctx, permissions, userID, params)
	ret0, _ := ret[0].([]byte)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockReportServiceMockRecorder) GenerateSystemReport(
	ctx, permissions, userID, params any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"GenerateSystemReport",
		reflect.TypeOf((*MockReportService)(nil).GenerateSystemReport),
		ctx, permissions, userID, params,
	)
}

func (m *MockReportService) GenerateSummaryReport(
	ctx context.Context,
	permissions []string,
	userID uuid.UUID,
	params dto.SummaryReportParams,
) ([]byte, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GenerateSummaryReport", ctx, permissions, userID, params)
	ret0, _ := ret[0].([]byte)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockReportServiceMockRecorder) GenerateSummaryReport(
	ctx, permissions, userID, params any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"GenerateSummaryReport",
		reflect.TypeOf((*MockReportService)(nil).GenerateSummaryReport),
		ctx, permissions, userID, params,
	)
}

func (m *MockReportService) GetAnalyticsReport(
	ctx context.Context,
	query dto.AnalyticsReportQuery,
) (*dto.AnalyticsReportResponse, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetAnalyticsReport", ctx, query)
	ret0, _ := ret[0].(*dto.AnalyticsReportResponse)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockReportServiceMockRecorder) GetAnalyticsReport(
	ctx, query any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"GetAnalyticsReport",
		reflect.TypeOf((*MockReportService)(nil).GetAnalyticsReport),
		ctx, query,
	)
}

func (m *MockReportService) StreamExportCSV(
	ctx context.Context,
	query dto.ReportExportQuery,
	writer io.Writer,
) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "StreamExportCSV", ctx, query, writer)
	ret0, _ := ret[0].(error)
	return ret0
}

func (mr *MockReportServiceMockRecorder) StreamExportCSV(
	ctx, query, writer any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"StreamExportCSV",
		reflect.TypeOf((*MockReportService)(nil).StreamExportCSV),
		ctx, query, writer,
	)
}

type MockRetentionService struct {
	ctrl     *gomock.Controller
	recorder *MockRetentionServiceMockRecorder
}

type MockRetentionServiceMockRecorder struct {
	mock *MockRetentionService
}

func NewMockRetentionService(ctrl *gomock.Controller) *MockRetentionService {
	mock := &MockRetentionService{ctrl: ctrl}
	mock.recorder = &MockRetentionServiceMockRecorder{mock}
	return mock
}

func (m *MockRetentionService) EXPECT() *MockRetentionServiceMockRecorder {
	return m.recorder
}

func (m *MockRetentionService) ExecuteRetention(
	ctx context.Context,
) (*dto.RetentionRunResponse, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ExecuteRetention", ctx)
	ret0, _ := ret[0].(*dto.RetentionRunResponse)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

func (mr *MockRetentionServiceMockRecorder) ExecuteRetention(
	ctx any,
) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(
		mr.mock,
		"ExecuteRetention",
		reflect.TypeOf((*MockRetentionService)(nil).ExecuteRetention),
		ctx,
	)
}

