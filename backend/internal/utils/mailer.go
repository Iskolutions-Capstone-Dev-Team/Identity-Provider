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
	subject := "Action Required: Activate Your PUP-Taguig Identity" +
		" Provider Account"
	to := mail.NewEmail("Valued User", toEmail)

	plainText := fmt.Sprintf(
		"Welcome to PUP-Taguig Identity Provider!\n\n"+
			"You have been invited to activate your account. "+
			"To get started, please visit the link below:\n\n"+
			"%s\n\n"+
			"If you did not expect this, please ignore this email.",
		regURL)

	htmlContent := fmt.Sprintf(
		"<div style='font-family: sans-serif; color: #333;'>"+
			"<h2>Welcome to PUP-Taguig Identity Provider!</h2>"+
			"<p>Hello! You have been invited to join the "+
			"IskSolutions Identity Provider.</p>"+
			"<p>To activate your account, click the button below:</p>"+
			"<div style='margin: 25px 0;'>"+
			"<a href='%s' style='background-color: #800000; "+
			"color: white; padding: 12px 25px; "+
			"text-decoration: none; border-radius: 5px; "+
			"display: inline-block;'>Activate Account</a>"+
			"</div>"+
			"<p style='font-size: 12px; color: #777;'>"+
			"If the button doesn't work, copy and paste this link: "+
			"<br>%s</p>"+
			"</div>", regURL, regURL)

	message := mail.NewSingleEmail(from, subject, to,
		plainText, htmlContent)
	client := sendgrid.NewSendClient(apiKey)
	_, err := client.Send(message)
	if err != nil {
		return fmt.Errorf("[SendInvitationEmail]: %w", err)
	}
	return nil
}
