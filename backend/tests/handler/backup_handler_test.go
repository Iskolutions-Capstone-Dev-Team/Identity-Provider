package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"go.uber.org/mock/gomock"
)

func TestGetLatestBackup(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockLogService := mocks.NewMockLogService(ctrl)
	handler := &v1.BackupHandler{
		LogService: mockLogService,
	}

	// Create a temp latest-backup.json
	os.MkdirAll("logs", 0755)
	defer os.RemoveAll("logs")

	info := v1.BackupInfo{
		Timestamp: "2026-08-23T21:30:00Z",
		Status:    "success",
		Type:      "daily",
		Size:      "1.5MB",
	}
	b, _ := json.Marshal(info)
	os.WriteFile(filepath.Join("logs", "latest-backup.json"), b, 0644)

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/admin/backup/latest", nil)
	c.Set("permissions", []string{"Manage Backup and Restore"})

	handler.GetLatestBackup(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var resp v1.BackupInfo
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Status != "success" || resp.Size != "1.5MB" {
		t.Errorf("unexpected response: %+v", resp)
	}
}

func TestPostRunBackupUnauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockLogService := mocks.NewMockLogService(ctrl)
	handler := &v1.BackupHandler{
		LogService: mockLogService,
	}

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("POST", "/admin/backup/run", nil)
	c.Set("permissions", []string{}) // missing permission

	handler.PostRunBackup(c)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", w.Code)
	}
}
