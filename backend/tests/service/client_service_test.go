package service_test

import (
	"context"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"github.com/google/uuid"
	"go.uber.org/mock/gomock"
)

/**
 * TestGetClientByID service test verifies business logic for client retrieval.
 */
func TestGetClientByID(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockClientRepository(ctrl)

	// S3Provider is a struct and hard to mock without extra layers.
	// Since GetClientByID ignores its error, we can pass nil here for simplicity.
	clientService := service.NewClientService(mockRepo, nil)

	clientID := uuid.New()
	userID := uuid.New()
	client := &models.Client{
		ID:         clientID[:],
		ClientName: "Test Client",
	}

	// 1. Setup mock expectations
	mockRepo.EXPECT().
		GetByID(gomock.Any(), clientID[:]).
		Return(client, nil)

	mockRepo.EXPECT().
		GetGrantTypes(gomock.Any(), clientID[:]).
		Return([]string{"authorization_code"}, nil)

	mockRepo.EXPECT().
		GetClientAllowedRoles(gomock.Any(), clientID[:]).
		Return([]models.Role{}, nil)

	// 2. Execute
	resp, err := clientService.GetClientByID(context.Background(), clientID, userID, []string{"View all appclients"})

	// 3. Verify
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if resp == nil {
		t.Fatal("expected response, got nil")
	}

	if resp.Name != client.ClientName {
		t.Errorf("expected name %s, got %s", client.ClientName, resp.Name)
	}
}

/**
 * TestGetAllowedClients verifies retrieval of allowed clients.
 */
func TestGetAllowedClients(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mocks.NewMockClientRepository(ctrl)
	clientService := service.NewClientService(mockRepo, nil)

	userID := uuid.New()
	clientID := uuid.New()
	client := models.Client{
		ID:         clientID[:],
		ClientName: "Test Client",
	}

	mockRepo.EXPECT().
		ListAllowedClients(gomock.Any(), 10, 0, "", userID[:]).
		Return([]models.Client{client}, nil)

	mockRepo.EXPECT().
		CountAllowedClients(gomock.Any(), "", userID[:]).
		Return(1, nil)

	resp, err := clientService.GetAllowedClients(context.Background(), userID, 10, 1, "")

	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	if resp == nil {
		t.Fatal("expected response, got nil")
	}

	if resp.TotalCount != 1 {
		t.Errorf("expected total count 1, got %d", resp.TotalCount)
	}

	if len(resp.Clients) != 1 {
		t.Errorf("expected 1 client, got %d", len(resp.Clients))
	}
}
