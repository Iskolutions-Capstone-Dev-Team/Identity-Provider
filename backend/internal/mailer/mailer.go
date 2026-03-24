package mailer

import (
	"log"
	"os"
	"strconv"

	"github.com/wneessen/go-mail"
)

const (
	DefaultSMTPPort = 1025
)

// PostMail sends a transactional email.
func PostMail(toAddr, subject, body string) error {
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")
	fromAddr := os.Getenv("SMTP_FROM_ADDR")
	fromName := os.Getenv("SMTP_FROM_NAME")

	policy := mail.NoTLS
	if host != "mailpit" && host != "localhost" {
		policy = mail.TLSMandatory // Or TLSMandatory for Production
	}

	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = DefaultSMTPPort
	}

	// Create message
	m := mail.NewMsg()
	if err := m.FromFormat(fromName, fromAddr); err != nil {
		log.Printf("[PostMailCustom] From Format: %v", err)
		return err
	}
	if err := m.To(toAddr); err != nil {
		log.Printf("[PostMail] Set To: %v", err)
		return err
	}
	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, body)

	// Configure client
	// For local Mailpit, auth is usually empty.
	c, err := mail.NewClient(host, 
		mail.WithPort(port),
		mail.WithTLSPolicy(policy),
	)
	if err != nil {
		log.Printf("[PostMail] Client Creation: %v", err)
		return err
	}

	// Send
	if err := c.DialAndSend(m); err != nil {
		log.Printf("[PostMail] DialAndSend: %v", err)
		return err
	}

	return nil
}
