package v1

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BackupHandler struct {
	LogService service.LogService
}

type BackupInfo struct {
	Timestamp string `json:"timestamp" example:"2026-08-02T19:15:15Z"`
	Status    string `json:"status" example:"success"`
	Type      string `json:"type" example:"daily"`
	Size      string `json:"size" example:"1.2MB"`
	Message   string `json:"message,omitempty" example:"no backup saved"`
}

// GetLatestBackup retrieves the latest backup information.
// @Summary Retrieve latest backup details
// @Description Returns status and timestamp of the last backup.
// @Tags Backup
// @Accept json
// @Produce json
// @Success 200 {object} BackupInfo
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security CookieAuth
// @Router /admin/backup/latest [get]
func (h *BackupHandler) GetLatestBackup(c *gin.Context) {
	if !middleware.HasPermission(c, "Manage Backup and Restore") {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			"Unauthorized",
		)
		return
	}

	jsonPath := filepath.Join("logs", "latest-backup.json")
	file, err := os.Open(jsonPath)
	if err != nil {
		c.JSON(http.StatusOK, BackupInfo{
			Message: "no backup saved",
		})
		return
	}
	defer file.Close()

	var info BackupInfo
	if err := json.NewDecoder(file).Decode(&info); err != nil {
		c.JSON(http.StatusOK, BackupInfo{
			Message: "no backup saved",
		})
		return
	}

	c.JSON(http.StatusOK, info)
}

// PostRunBackup executes a manual backup run.
// @Summary Run manual backup
// @Description Triggers the core MySQL S3 backup script.
// @Tags Backup
// @Accept json
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security CookieAuth
// @Router /admin/backup/run [post]
func (h *BackupHandler) PostRunBackup(c *gin.Context) {
	if !middleware.HasPermission(c, "Manage Backup and Restore") {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			"Unauthorized",
		)
		return
	}

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	scriptPath := filepath.Join("scripts", "mysql-backup-s3.sh")
	cmd := exec.Command("/bin/bash", scriptPath)
	cmd.Env = append(os.Environ(),
		"BACKUP_ACTOR="+actorName,
		"CLIENT_IP="+c.ClientIP(),
		"USER_AGENT="+c.Request.UserAgent(),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("[PostRunBackup] execution failed: %v, output: %s",
			err, string(output))
		errors.SendString(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Backup execution failed.",
			string(output),
		)
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Backup executed successfully:\n" + string(output),
	})
}

// PostRestoreBackup restores the database from a uploaded file.
// @Summary Restore database from backup file
// @Description Restores the MySQL database using the provided file.
// @Tags Backup
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Backup file (.sql.gz)"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Security CookieAuth
// @Router /admin/backup/restore [post]
func (h *BackupHandler) PostRestoreBackup(c *gin.Context) {
	if !middleware.HasPermission(c, "Manage Backup and Restore") {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			"Unauthorized",
		)
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Missing backup file in request.",
			err,
		)
		return
	}

	tempDir := os.TempDir()
	tempPath := filepath.Join(tempDir, file.Filename)

	if err := c.SaveUploadedFile(file, tempPath); err != nil {
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to save uploaded file.",
			err,
		)
		return
	}
	defer os.Remove(tempPath)

	userIDStr := c.GetString("user_id")
	userID, _ := uuid.Parse(userIDStr)
	ctx := c.Request.Context()
	actorName, _ := h.LogService.GetUserEmail(ctx, userID[:])
	if actorName == "" {
		actorName = userIDStr
	}

	scriptPath := filepath.Join("scripts", "mysql-restore.sh")
	cmd := exec.Command("/bin/bash", scriptPath, tempPath)
	cmd.Env = append(os.Environ(),
		"BACKUP_ACTOR="+actorName,
		"CLIENT_IP="+c.ClientIP(),
		"USER_AGENT="+c.Request.UserAgent(),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("[PostRestoreBackup] execution failed: %v, output: %s",
			err, string(output))
		errors.SendString(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Database restoration failed.",
			string(output),
		)
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Database restored successfully:\n" + string(output),
	})
}
