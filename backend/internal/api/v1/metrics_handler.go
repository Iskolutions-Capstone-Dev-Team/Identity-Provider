package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/middleware"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MetricsHandler struct {
	MetricsService service.MetricsService
}

func NewMetricsHandler(svc service.MetricsService) *MetricsHandler {
	return &MetricsHandler{MetricsService: svc}
}

// GetDashboardMetrics returns login stats and threat analysis.
func (h *MetricsHandler) GetDashboardMetrics(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf(
			"[MetricsHandler] GetDashboardMetrics: invalid user ID: %v",
			err,
		)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user context.",
			err,
		)
		return
	}

	permissions := c.GetStringSlice("permissions")

	metrics, err := h.MetricsService.GetDashboardMetrics(
		c.Request.Context(),
		userID,
		permissions,
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetDashboardMetrics error: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to retrieve dashboard metrics.",
			err,
		)
		return
	}

	c.JSON(http.StatusOK, metrics)
}

// GetMetricsReportPDF generates and streams the PDF report.
func (h *MetricsHandler) GetMetricsReportPDF(c *gin.Context) {
	userIDStr := c.GetString("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf(
			"[MetricsHandler] GetMetricsReportPDF: invalid user ID: %v",
			err,
		)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user context.",
			err,
		)
		return
	}

	permissions := c.GetStringSlice("permissions")

	pdfBytes, err := h.MetricsService.GenerateReportPDF(
		c.Request.Context(),
		userID,
		permissions,
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetMetricsReportPDF error: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to generate metrics report.",
			err,
		)
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header(
		"Content-Disposition",
		"attachment; filename=\"metrics_report.pdf\"",
	)
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}

// GetClientMetrics returns card metrics for the clients subgroup.
func (h *MetricsHandler) GetClientMetrics(c *gin.Context) {
	if !middleware.HasPermission(c, "View all appclients") &&
		!middleware.HasPermission(c, "View connected appclients") {
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
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf(
			"[MetricsHandler] GetClientMetrics: invalid user ID: %v",
			err,
		)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user context.",
			err,
		)
		return
	}

	permissions := c.GetStringSlice("permissions")

	metrics, err := h.MetricsService.GetClientMetrics(
		c.Request.Context(),
		permissions,
		userID,
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetClientMetrics error: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to retrieve client metrics.",
			err,
		)
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetRoleMetrics returns card metrics for the roles subgroup.
func (h *MetricsHandler) GetRoleMetrics(c *gin.Context) {
	if !middleware.HasPermission(c, "View roles") {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			"Unauthorized",
		)
		return
	}

	metrics, err := h.MetricsService.GetRoleMetrics(
		c.Request.Context(),
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetRoleMetrics error: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to retrieve role metrics.",
			err,
		)
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetUserMetrics returns card metrics for the users subgroup.
func (h *MetricsHandler) GetUserMetrics(c *gin.Context) {
	if !middleware.HasPermission(c, "View all users") &&
		!middleware.HasPermission(c, "View users based on appclient") {
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
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		log.Printf(
			"[MetricsHandler] GetUserMetrics: invalid user ID: %v",
			err,
		)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user context.",
			err,
		)
		return
	}

	permissions := c.GetStringSlice("permissions")

	metrics, err := h.MetricsService.GetUserMetrics(
		c.Request.Context(),
		permissions,
		userID,
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetUserMetrics error: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to retrieve user metrics.",
			err,
		)
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetLogMetrics returns card metrics for the logs subgroup.
func (h *MetricsHandler) GetLogMetrics(c *gin.Context) {
	if !middleware.HasPermission(c, "View audit logs") &&
		!middleware.HasPermission(c, "View security logs") {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			"Unauthorized",
		)
		return
	}

	metrics, err := h.MetricsService.GetLogMetrics(
		c.Request.Context(),
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetLogMetrics error: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to retrieve log metrics.",
			err,
		)
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetPermissionMetrics returns card metrics for the permissions subgroup.
func (h *MetricsHandler) GetPermissionMetrics(c *gin.Context) {
	if !middleware.HasPermission(c, "View roles") {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			"Unauthorized",
		)
		return
	}

	metrics, err := h.MetricsService.GetPermissionMetrics(
		c.Request.Context(),
	)
	if err != nil {
		log.Printf("[MetricsHandler] GetPermissionMetrics error: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to retrieve permission metrics.",
			err,
		)
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// GetRegistrationMetrics returns card metrics for the registration subgroup.
func (h *MetricsHandler) GetRegistrationMetrics(c *gin.Context) {
	if !middleware.HasPermission(c, "View Registration Config") {
		errors.SendString(
			c,
			http.StatusUnauthorized,
			errors.CodeUnauthorized,
			"Unauthorized access.",
			"Unauthorized",
		)
		return
	}

	metrics, err := h.MetricsService.GetRegistrationMetrics(
		c.Request.Context(),
	)
	if err != nil {
		log.Printf(
			"[MetricsHandler] GetRegistrationMetrics error: %v",
			err,
		)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to retrieve registration metrics.",
			err,
		)
		return
	}
	c.JSON(http.StatusOK, metrics)
}
