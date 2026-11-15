package handler_test

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	v1 "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
)

func TestReportHandler_GetAnalyticsReport(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockReportSvc := mocks.NewMockReportService(ctrl)
	handler := v1.NewReportHandler(mockReportSvc)

	t.Run("Forbidden without permission", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/reports?from=2026-01-01&to=2026-06-01", nil)
		c.Set("permissions", []string{"View users"})

		handler.GetAnalyticsReport(c)
		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("Success with View audit logs permission", func(t *testing.T) {
		mockReportSvc.EXPECT().
			GetAnalyticsReport(gomock.Any(), gomock.Any()).
			Return(&dto.AnalyticsReportResponse{
				From:     "2026-01-01",
				To:       "2026-06-01",
				Interval: "week",
				Type:     "all",
				Summary: dto.AnalyticsKPISummary{
					TotalEvents: 500,
				},
			}, nil)

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/reports?from=2026-01-01&to=2026-06-01", nil)
		c.Set("permissions", []string{"View audit logs"})

		handler.GetAnalyticsReport(c)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp dto.AnalyticsReportResponse
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.Equal(t, int64(500), resp.Summary.TotalEvents)
	})
}

func TestReportHandler_ExportReportCSV(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockReportSvc := mocks.NewMockReportService(ctrl)
	handler := v1.NewReportHandler(mockReportSvc)

	t.Run("Forbidden without permission", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/reports/export?from=2026-01-01&to=2026-06-01", nil)
		c.Set("permissions", []string{"View all users"})

		handler.ExportReportCSV(c)
		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("Success with View security logs permission", func(t *testing.T) {
		mockReportSvc.EXPECT().
			StreamExportCSV(gomock.Any(), gomock.Any(), gomock.Any()).
			DoAndReturn(func(ctx any, query dto.ReportExportQuery, w io.Writer) error {
				_, err := w.Write([]byte("ID,Type,Actor\n1,audit,admin@example.com\n"))
				return err
			})

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/reports/export?from=2026-01-01&to=2026-06-01", nil)
		c.Set("permissions", []string{"View security logs"})

		handler.ExportReportCSV(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "text/csv", w.Header().Get("Content-Type"))
		assert.Contains(t, w.Header().Get("Content-Disposition"), "attachment; filename=\"report-")
		assert.Contains(t, w.Body.String(), "1,audit,admin@example.com")
	})
}

func TestReportHandler_TriggerRetentionRun(t *testing.T) {
	gin.SetMode(gin.TestMode)
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRetentionSvc := mocks.NewMockRetentionService(ctrl)
	handler := v1.NewReportHandler(nil, mockRetentionSvc)

	t.Run("Forbidden for regular admin", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("POST", "/logs/retention/run", nil)
		c.Set("role", "Admin")

		handler.TriggerRetentionRun(c)
		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("Success for Superadmin", func(t *testing.T) {
		mockRetentionSvc.EXPECT().
			ExecuteRetention(gomock.Any()).
			Return(&dto.RetentionRunResponse{
				Status:            "completed",
				AuditLogsPurged:   150,
				SecurityLogsPurged: 25,
			}, nil)

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("POST", "/logs/retention/run", nil)
		c.Set("role", "Superadmin")

		handler.TriggerRetentionRun(c)
		assert.Equal(t, http.StatusOK, w.Code)

		var resp dto.RetentionRunResponse
		err := json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NoError(t, err)
		assert.Equal(t, "completed", resp.Status)
		assert.Equal(t, int64(150), resp.AuditLogsPurged)
	})
}

