package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api/v1"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

/**
 * TestGetClientHandler verifies the GET /admin/clients/:id endpoint.
 */
func TestGetClientHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockClientService := mocks.NewMockClientService(ctrl)
	mockLogService := mocks.NewMockLogService(ctrl)

	handler := &v1.ClientHandler{
		Service:    mockClientService,
		LogService: mockLogService,
	}

	clientID := uuid.New()
	clientResp := &dto.ClientResponse{
		ID:   clientID.String(),
		Name: "Test Client",
	}

	// 1. Setup mock expectations
	mockClientService.EXPECT().
		GetClientByID(gomock.Any(), clientID, gomock.Any(), gomock.Any()).
		Return(clientResp, nil)

	mockLogService.EXPECT().
		ResolveClientName(gomock.Any(), clientID.String()).
		Return("Test Client").
		AnyTimes()

	mockLogService.EXPECT().
		GetUserEmail(gomock.Any(), gomock.Any()).
		Return("admin@example.com", nil).
		AnyTimes()

	mockLogService.EXPECT().
		PostAuditLogWithActorString(gomock.Any(), gomock.Any(), gomock.Any()).
		Return(nil).
		AnyTimes()

	// 2. Create context and request
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Params = []gin.Param{{Key: "id", Value: clientID.String()}}
	c.Set("user_id", uuid.New().String())
	c.Request, _ = http.NewRequest("GET", "/admin/clients/"+clientID.String(), nil)

	// 3. Execute
	handler.GetClient(c)

	// 4. Verify results
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	var raw map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &raw)

	// The handler returns c.JSON(http.StatusOK, gin.H{"client": client})
	clientMap := raw["client"].(map[string]interface{})
	if clientMap["name"] != clientResp.Name {
		t.Errorf("expected name %s, got %s", clientResp.Name, clientMap["name"])
	}
}
