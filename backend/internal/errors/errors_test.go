package errors

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func parseResponse(w *httptest.ResponseRecorder) dto.ErrorResponse {
	var resp dto.ErrorResponse
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	return resp
}

func TestSend_RedactsDatabaseErrors(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	rawErr := fmt.Errorf("sql: no rows in result set")
	Send(
		c,
		http.StatusBadRequest,
		CodeDatabaseError,
		"Resource was not found.",
		rawErr,
	)

	resp := parseResponse(w)
	if resp.Error == rawErr.Error() {
		t.Fatalf("expected raw sql error to be redacted, got: %s", resp.Error)
	}
	if resp.Error != "Resource was not found." {
		t.Errorf("expected sanitized error matching msg, got: %s", resp.Error)
	}
}

func TestSend_RedactsQuerySyntaxErrors(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	rawErr := fmt.Errorf("database query (GetByID): syntax error near 'SELECT'")
	Send(
		c,
		http.StatusBadRequest,
		CodeDatabaseError,
		"Query execution failed.",
		rawErr,
	)

	resp := parseResponse(w)
	if resp.Error != "Query execution failed." {
		t.Errorf("expected sanitized error msg, got: %s", resp.Error)
	}
}

func TestSend_RedactsInternalServerErrorStatus(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	rawErr := fmt.Errorf("unexpected internal crash details")
	Send(
		c,
		http.StatusInternalServerError,
		CodeInternalError,
		"An unexpected error occurred.",
		rawErr,
	)

	resp := parseResponse(w)
	if resp.Error != "An unexpected error occurred." {
		t.Errorf("expected 500 error to be masked to msg, got: %s", resp.Error)
	}
}

func TestSend_PreservesSafeClientErrors(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	rawErr := fmt.Errorf("invalid authorization code format")
	Send(
		c,
		http.StatusBadRequest,
		CodeInvalidInput,
		"The authorization code is invalid.",
		rawErr,
	)

	resp := parseResponse(w)
	if resp.Error != "invalid authorization code format" {
		t.Errorf("expected safe error to be preserved, got: %s", resp.Error)
	}
}

func TestSendString_RedactsDatabaseErrors(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	SendString(
		c,
		http.StatusBadRequest,
		CodeDatabaseError,
		"Client lookup failed.",
		"SELECT client_secret FROM clients WHERE id = 1",
	)

	resp := parseResponse(w)
	if resp.Error != "Client lookup failed." {
		t.Errorf("expected raw query string to be redacted, got: %s", resp.Error)
	}
}

func TestSendWithCaptcha_RedactsDatabaseErrors(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	rawErr := fmt.Errorf("mysql: connection refused")
	SendWithCaptcha(
		c,
		http.StatusBadRequest,
		CodeCaptchaRequired,
		"Please complete captcha.",
		rawErr,
		"test-site-key",
	)

	resp := parseResponse(w)
	if resp.Error != "Please complete captcha." {
		t.Errorf("expected mysql error to be redacted, got: %s", resp.Error)
	}
	if !resp.RequiresCaptcha {
		t.Errorf("expected RequiresCaptcha to be true")
	}
}
