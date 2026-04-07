package utils

import (
	"fmt"
	"os"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

// SendOTPEmail sends an OTP code to the user's email.
func SendOTPEmail(toEmail string, otp string) error {
	apiKey := os.Getenv("SENDGRID_API_KEY")
	fromEmail := os.Getenv("SENDGRID_FROM_EMAIL")
	fromName := os.Getenv("SENDGRID_FROM_NAME")

	if apiKey == "" || fromEmail == "" {
		return fmt.Errorf("mailer: missing sendgrid configuration")
	}

	from := mail.NewEmail(fromName, fromEmail)
	subject := "Your One-Time Password (OTP)"
	to := mail.NewEmail("User", toEmail)
	plainTextContent := fmt.Sprintf("Your OTP code is: %s", otp)
	htmlContent := fmt.Sprintf("<strong>Your OTP code is: %s</strong>", otp)
	message := mail.NewSingleEmail(from, subject, to, 
		plainTextContent, htmlContent)
	client := sendgrid.NewSendClient(apiKey)
	_, err := client.Send(message)
	if err != nil {
		return fmt.Errorf("[SendOTPEmail]: %w", err)
	}
	return nil
}

// SendInvitationEmail sends an invitation code to the user's email.
func SendInvitationEmail(toEmail string, invitationCode string) error {
	apiKey := os.Getenv("SENDGRID_API_KEY")
	fromEmail := os.Getenv("SENDGRID_FROM_EMAIL")
	fromName := os.Getenv("SENDGRID_FROM_NAME")
	clientBaseURL := os.Getenv("CLIENT_BASE_URL")

	if apiKey == "" || fromEmail == "" {
		return fmt.Errorf("mailer: missing sendgrid configuration")
	}

	regURL := fmt.Sprintf("%s/register?invitation_code=%s", 
		clientBaseURL, invitationCode)

	from := mail.NewEmail(fromName, fromEmail)
	subject := "Invitation to Join IskSolutions Identity Provider"
	to := mail.NewEmail("Invited User", toEmail)
	
	plainText := fmt.Sprintf(
		"You are invited. Register here: %s", regURL)
	htmlContent := fmt.Sprintf(
		"You are invited. <a href='%s'>Register here</a>", regURL)

	message := mail.NewSingleEmail(from, subject, to, 
		plainText, htmlContent)
	client := sendgrid.NewSendClient(apiKey)
	_, err := client.Send(message)
	if err != nil {
		return fmt.Errorf("[SendInvitationEmail]: %w", err)
	}
	return nil
}

