package utils

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v3"
)

// SendOTPEmail sends an OTP code using Resend.
func SendOTPEmail(toEmail string, otp string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	fromEmail := os.Getenv("RESEND_FROM_EMAIL")
	fromName := os.Getenv("RESEND_FROM_NAME")

	if apiKey == "" || fromEmail == "" {
		return fmt.Errorf("mailer: missing resend configuration")
	}

	client := resend.NewClient(apiKey)
	from := fmt.Sprintf("%s <%s>", fromName, fromEmail)
	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{toEmail},
		Subject: "Your One-Time Password (OTP)",
		Html:    fmt.Sprintf("<strong>Your OTP code is: %s</strong>", otp),
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("[SendOTPEmail]: %w", err)
	}
	return nil
}

// SendInvitationEmail sends an invitation code using Resend.
func SendInvitationEmail(toEmail string, invitationCode string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	fromEmail := os.Getenv("RESEND_FROM_EMAIL")
	fromName := os.Getenv("RESEND_FROM_NAME")
	clientBaseURL := os.Getenv("CLIENT_BASE_URL")

	if apiKey == "" || fromEmail == "" {
		return fmt.Errorf("mailer: missing resend configuration")
	}

	regURL := fmt.Sprintf("%s/register?invitation_code=%s",
		clientBaseURL, invitationCode)

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

	client := resend.NewClient(apiKey)
	from := fmt.Sprintf("%s <%s>", fromName, fromEmail)
	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{toEmail},
		Subject: "Action Required: Activate Your " +
			"PUP-Taguig Identity Provider Account",
		Html:    htmlContent,
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("[SendInvitationEmail]: %w", err)
	}
	return nil
}
