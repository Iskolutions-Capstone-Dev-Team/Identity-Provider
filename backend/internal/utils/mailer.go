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
		Html:    buildOTPEmailHTML(otp),
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

	client := resend.NewClient(apiKey)
	from := fmt.Sprintf("%s <%s>", fromName, fromEmail)
	params := &resend.SendEmailRequest{
		From: from,
		To:   []string{toEmail},
		Subject: "Action Required: Activate Your " +
			"PUP-Taguig Identity Provider Account",
		Html: buildInvitationEmailHTML(regURL),
	}

	_, err := client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("[SendInvitationEmail]: %w", err)
	}
	return nil
}

func buildOTPEmailHTML(otp string) string {
	content := fmt.Sprintf(`
		<table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
			<tr>
				<td style="padding: 64px 72px 110px;">
					<div style="background: #fff3d1; border-radius: 12px; padding: 42px 28px; text-align: center;">
						<p style="margin: 0 0 14px; color: #111111; font-size: 22px; line-height: 1.4;">Your OTP code is:</p>
						<p style="margin: 0; color: #9b0000; font-size: 48px; line-height: 1; font-weight: 800; letter-spacing: 2px;">%s</p>
					</div>
				</td>
			</tr>
		</table>`,
		otp,
	)

	return buildEmailShell(content)
}

func buildInvitationEmailHTML(regURL string) string {
	content := fmt.Sprintf(`
		<table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
			<tr>
				<td style="padding: 34px 60px 18px; text-align: left;">
					<h1 style="margin: 0; color: #050505; font-size: 26px; line-height: 1.35; font-weight: 800;">
						Welcome to PUP-Taguig Identity Provider!
					</h1>
				</td>
			</tr>
			<tr>
				<td style="padding: 10px 64px 0;">
					<p style="margin: 0 0 16px; color: #050505; font-size: 15px; line-height: 1.45;">
						Hello! You have been invited to join the Iskolutions Identity Provider.
					</p>
					<p style="margin: 0 0 16px; color: #050505; font-size: 15px; line-height: 1.45;">
						To activate your account, click the button below:
					</p>
					<p style="margin: 0 0 20px; text-align: center;">
						<a href="%s" style="display: inline-block; min-width: 210px; padding: 13px 20px; border-radius: 7px; background: #9b0000; color: #ffffff; font-size: 16px; line-height: 1; font-weight: 800; text-decoration: none;">
							Activate Account <span style="color: #ffc400; font-size: 20px; line-height: 0;">&#8594;</span>
						</a>
					</p>
					<p style="margin: 12px 0 0; color: #898989; font-size: 13px; line-height: 1.45;">
						If the button doesn't work, copy and paste this link:
					</p>
					<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom: 26px;">
						<tr>
							<td style="padding: 0;">
								<a href="%s" style="color: #9b0000; font-size: 12px; line-height: 1.35; font-weight: 700; word-break: break-all;">%s</a>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>`,
		regURL,
		regURL,
		regURL,
	)

	return buildEmailShell(content)
}

func buildEmailShell(content string) string {
	return fmt.Sprintf(`
		<div style="margin: 0; padding: 20px; background: #ffffff; font-family: Arial, Helvetica, sans-serif;">
			<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width: 720px; margin: 0 auto; border: 1px solid #e2e2e2; border-bottom: 5px solid #9b0000; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);">
				<tr>
					<td style="background: #9b0000; padding: 16px 30px 16px;">
						<p style="margin: 0; font-size: 24px; line-height: 1; font-weight: 800; text-align: center;">
							<span style="color: #ffffff;">PUP-TAGUIG</span><br>
							<span style="color: #ffea00; font-size: 14px; line-height: 1.2;">Identity Provider</span>
						</p>
					</td>
				</tr>
				<tr>
					<td style="background: #ffffff;">
						%s
					</td>
				</tr>
				<tr>
					<td style="background: #fff3d1; padding: 24px 54px; color: #050505; font-size: 13px; line-height: 1.5;">
						<p style="margin: 0 0 4px;">This is an automated message. Please do not reply to this email.</p>
						<p style="margin: 0;">&copy; 2026 PUP-Taguig Identity Provider. All rights reserved.</p>
					</td>
				</tr>
			</table>
		</div>`,
		content,
	)
}
