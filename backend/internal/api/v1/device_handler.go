package v1

import (
	"log"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/errors"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// DeviceHandler manages trust device endpoints.
type DeviceHandler struct {
	Service service.DeviceService
}

// ListDevices lists trusted devices for the authenticated user.
func (h *DeviceHandler) ListDevices(c *gin.Context) {
	uVal, exists := c.Get("user_id")
	if !exists {
		log.Print("[DeviceHandler] ListDevices: missing user context")
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Missing session context.",
			"missing session context",
		)
		return
	}

	userID, err := uuid.Parse(uVal.(string))
	if err != nil {
		log.Printf("[DeviceHandler] ListDevices: invalid user ID format: %v", err)
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user identification format.",
			"invalid user identification format",
		)
		return
	}

	devices, err := h.Service.ListDevices(c.Request.Context(), userID)
	if err != nil {
		log.Printf("[DeviceHandler] ListDevices: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to list trusted devices.",
			err,
		)
		return
	}

	c.JSON(http.StatusOK, devices)
}

// UpdateDevice renames a trusted device for the authenticated user.
func (h *DeviceHandler) UpdateDevice(c *gin.Context) {
	uVal, exists := c.Get("user_id")
	if !exists {
		log.Print("[DeviceHandler] UpdateDevice: missing user context")
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Missing session context.",
			"missing session context",
		)
		return
	}

	userID, err := uuid.Parse(uVal.(string))
	if err != nil {
		log.Printf("[DeviceHandler] UpdateDevice: invalid user ID format: %v", err)
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user identification format.",
			"invalid user identification format",
		)
		return
	}

	deviceIDStr := c.Param("id")
	deviceID, err := uuid.Parse(deviceIDStr)
	if err != nil {
		log.Printf("[DeviceHandler] UpdateDevice: invalid device ID format: %v", err)
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid device identification format.",
			"invalid device identification format",
		)
		return
	}

	var req dto.UpdateDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[DeviceHandler] UpdateDevice Bind JSON: %v", err)
		errors.Send(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid request payload.",
			err,
		)
		return
	}

	err = h.Service.UpdateDeviceName(
		c.Request.Context(),
		deviceID,
		userID,
		req.Name,
	)
	if err != nil {
		log.Printf("[DeviceHandler] UpdateDevice: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to update trusted device name.",
			err,
		)
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Device renamed successfully",
	})
}

// DeleteDevice deletes a trusted device for the authenticated user.
func (h *DeviceHandler) DeleteDevice(c *gin.Context) {
	uVal, exists := c.Get("user_id")
	if !exists {
		log.Print("[DeviceHandler] DeleteDevice: missing user context")
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Missing session context.",
			"missing session context",
		)
		return
	}

	userID, err := uuid.Parse(uVal.(string))
	if err != nil {
		log.Printf("[DeviceHandler] DeleteDevice: invalid user ID format: %v", err)
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid user identification format.",
			"invalid user identification format",
		)
		return
	}

	deviceIDStr := c.Param("id")
	deviceID, err := uuid.Parse(deviceIDStr)
	if err != nil {
		log.Printf("[DeviceHandler] DeleteDevice: invalid device ID format: %v", err)
		errors.SendString(
			c,
			http.StatusBadRequest,
			errors.CodeInvalidInput,
			"Invalid device identification format.",
			"invalid device identification format",
		)
		return
	}

	err = h.Service.DeleteDevice(c.Request.Context(), deviceID, userID)
	if err != nil {
		log.Printf("[DeviceHandler] DeleteDevice: %v", err)
		errors.Send(
			c,
			http.StatusInternalServerError,
			errors.CodeInternalError,
			"Failed to delete trusted device.",
			err,
		)
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Device deleted successfully",
	})
}
