package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestNewSwaggerHandler verifies swagger files v2 bundle serving.
func TestNewSwaggerHandler(t *testing.T) {
	handler := NewSwaggerHandler()
	assert.NotNil(t, handler)

	req := httptest.NewRequest(
		http.MethodGet,
		"/swagger-ui-bundle.js",
		nil,
	)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	body := w.Body.String()
	assert.True(t, strings.Contains(body, `DOMPurify.version="3.4.17"`))
}
