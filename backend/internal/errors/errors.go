// Package errors provides error code definitions and helper functions.
package errors

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/gin-gonic/gin"
)

// Standard developer error codes
const (
	CodeInternalError      = 1000
	CodeInvalidInput       = 1001
	CodeUnauthorized       = 1002
	CodeForbidden          = 1003
	CodeNotFound           = 1004
	CodeDatabaseError      = 1005
	CodeInvalidCredentials = 1006
	CodeSessionExpired     = 1007
	CodeTokenExpired       = 1008
	CodeMFAFailed          = 1009
	CodeOTPFailed          = 1010
	CodeRegistrationFailed = 1011
	CodeClientError        = 1012
	CodeRateLimitExceeded  = 1029
)

// Send sends a standardized error response to the client.
func Send(c *gin.Context, status int, code int, msg string, err error) {
	errStr := ""
	if err != nil {
		errStr = err.Error()
	}
	c.JSON(status, dto.ErrorResponse{
		Code:    code,
		Message: msg,
		Error:   errStr,
	})
}

// SendString sends a standardized error response with raw error string.
func SendString(
	c *gin.Context,
	status int,
	code int,
	msg string,
	errStr string,
) {
	c.JSON(status, dto.ErrorResponse{
		Code:    code,
		Message: msg,
		Error:   errStr,
	})
}
