package v1

import (
	"fmt"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/gin-gonic/gin"
)

type OTPHandler struct {
	Service *service.OTPService
}

/**
 * PostOTP handles the generation and sending of a new OTP.
 * It binds the JSON request and calls the service layer.
 */
func (h *OTPHandler) PostOTP(c *gin.Context) {
	var req dto.OTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("[PostOTP] Bind JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid request payload",
		})
		return
	}

	res, err := h.Service.GenerateOTP(c.Request.Context(), req)
	if err != nil {
		fmt.Printf("[PostOTP] Generate OTP: %v\n", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to process OTP request",
		})
		return
	}

	c.JSON(http.StatusOK, dto.OTPResponse{
		Message: "OTP has been sent to your email",
		ExpiresAt: res.ExpiresAt,
		RetryCount: res.RetryCount,
	})
}

/**
 * PostOTPVerify validates the code provided by the user.
 * It returns a success response if the code matches and is active.
 */
func (h *OTPHandler) PostOTPVerify(c *gin.Context) {
	var req dto.PostOTPVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("[PostOTPVerify] Bind JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error: "Invalid verification payload",
		})
		return
	}

	isValid, err := h.Service.VerifyOTP(c.Request.Context(), req)
	if err != nil {
		fmt.Printf("[PostOTPVerify] Verify OTP: %v\n", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Internal server error during verification",
		})
		return
	}

	if !isValid {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error: "The code provided is invalid or has expired",
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Email verified successfully",
	})
}
