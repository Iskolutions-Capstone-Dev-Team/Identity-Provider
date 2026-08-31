package service_test

import (
	"context"
	"testing"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/tests/mocks"
	"go.uber.org/mock/gomock"
)

func TestSendAndSaveInvitation(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockOTPRepo := mocks.NewMockOTPRepository(ctrl)
	mockInvRepo := mocks.NewMockInvitationRepository(ctrl)

	mailSvc := service.NewMailService(mockOTPRepo, mockInvRepo)

	email := "test@example.com"
	accountTypeID := 2

	// Stub the package-level SendInvitationEmail function
	originalSend := utils.SendInvitationEmail
	defer func() { utils.SendInvitationEmail = originalSend }()

	utils.SendInvitationEmail = func(toEmail string, code string) error {
		if toEmail != email {
			t.Errorf("expected email %s, got %s", email, toEmail)
		}
		if code == "" {
			t.Error("expected non-empty invitation code")
		}
		return nil
	}

	// Expect existing invitation deletion
	mockInvRepo.EXPECT().
		DeleteInvitation(gomock.Any(), email).
		Return(nil).
		Times(1)

	// Expect creation of new invitation
	mockInvRepo.EXPECT().
		CreateInvitation(gomock.Any(), gomock.Any()).
		DoAndReturn(func(
			ctx context.Context, inv *models.InvitationCode,
		) error {
			if inv.Email != email {
				t.Errorf("expected email %s, got %s", email, inv.Email)
			}
			if inv.AccountTypeID != accountTypeID {
				t.Errorf(
					"expected type %d, got %d",
					accountTypeID,
					inv.AccountTypeID,
				)
			}
			return nil
		}).
		Times(1)

	ctx := context.Background()
	err := mailSvc.SendAndSaveInvitation(ctx, email, accountTypeID)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
}
