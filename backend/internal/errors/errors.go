// Package errors provides error code definitions and helper functions.
package errors

import (
	"log"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/gin-gonic/gin"
)

// Standard developer error codes
const (
	CodeInternalError        = 1000
	CodeInvalidInput         = 1001
	CodeUnauthorized         = 1002
	CodeForbidden            = 1003
	CodeNotFound             = 1004
	CodeDatabaseError        = 1005
	CodeInvalidCredentials   = 1006
	CodeSessionExpired       = 1007
	CodeTokenExpired         = 1008
	CodeMFAFailed            = 1009
	CodeOTPFailed            = 1010
	CodeRegistrationFailed   = 1011
	CodeClientError          = 1012
	CodeRateLimitExceeded    = 1029
	CodeSuspended            = 1030
	CodePasswordRecentlyUsed = 1031
	CodeCaptchaRequired      = 1032
)

// isSensitiveError detects raw database and internal system error strings.
func isSensitiveError(errStr string) bool {
	if errStr == "" {
		return false
	}
	lower := strings.ToLower(errStr)
	sensitivePatterns := []string{
		"sql:",
		"database query",
		"mysql",
		"syntax error",
		"for update",
		"select ",
		"insert into",
		"update ",
		"delete from",
		"duplicate entry",
		"broken pipe",
		"connection refused",
	}
	for _, pattern := range sensitivePatterns {
		if strings.Contains(lower, pattern) {
			return true
		}
	}
	return false
}

// sanitizeError cleanses sensitive database errors from public responses.
func sanitizeError(status int, msg string, errStr string) string {
	if status >= 500 || isSensitiveError(errStr) {
		return msg
	}
	return errStr
}

// Send sends a standardized error response to the client.
/**
 * Send redacts internal database errors and logs technical
 * details to maintain security and prevent information leaks.
 */
func Send(c *gin.Context, status int, code int, msg string, err error) {
	errStr := ""
	if err != nil {
		errStr = err.Error()
		if status >= 500 || isSensitiveError(errStr) {
			log.Printf("[Send] Status %d Code %d: %v", status, code, err)
		}
	}
	c.JSON(status, dto.ErrorResponse{
		Code:    code,
		Message: msg,
		Error:   sanitizeError(status, msg, errStr),
	})
}

// SendWithCaptcha sends a standardized error response requesting CAPTCHA.
/**
 * SendWithCaptcha redacts internal errors and includes captcha challenge data.
 */
func SendWithCaptcha(
	c *gin.Context,
	status int,
	code int,
	msg string,
	err error,
	siteKey string,
) {
	errStr := ""
	if err != nil {
		errStr = err.Error()
		if status >= 500 || isSensitiveError(errStr) {
			log.Printf(
				"[SendWithCaptcha] Status %d Code %d: %v",
				status,
				code,
				err,
			)
		}
	}
	c.JSON(status, dto.ErrorResponse{
		Code:            code,
		Message:         msg,
		Error:           sanitizeError(status, msg, errStr),
		RequiresCaptcha: true,
		SiteKey:         siteKey,
	})
}

// SendString sends a standardized error response with raw error string.
/**
 * SendString redacts internal database errors from raw error strings.
 */
func SendString(
	c *gin.Context,
	status int,
	code int,
	msg string,
	errStr string,
) {
	if status >= 500 || isSensitiveError(errStr) {
		log.Printf("[SendString] Status %d Code %d: %s", status, code, errStr)
	}
	c.JSON(status, dto.ErrorResponse{
		Code:    code,
		Message: msg,
		Error:   sanitizeError(status, msg, errStr),
	})
}
