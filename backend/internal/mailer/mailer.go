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
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")

	policy := mail.NoTLS
	if host != "mailpit" && host != "localhost" {
		policy = mail.TLSMandatory
	}

	port, err := strconv.Atoi(portStr)
	if err != nil {
		port = DefaultSMTPPort
	}

	m := mail.NewMsg()
	if err := m.FromFormat(fromName, fromAddr); err != nil {
		log.Printf("[PostMail] From Format: %v", err)
		return err
	}
	if err := m.To(toAddr); err != nil {
		log.Printf("[PostMail] Set To: %v", err)
		return err
	}
	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, body)

	c, err := mail.NewClient(host,
		mail.WithPort(port),
		mail.WithTLSPolicy(policy),
	)
	if err != nil {
		log.Printf("[PostMail] Client Creation: %v", err)
		return err
	}

	if user != "" && pass != "" {
		c.SetSMTPAuth(mail.SMTPAuthPlain)
	}

	if err := c.DialAndSend(m); err != nil {
		log.Printf("[PostMail] DialAndSend: %v", err)
		return err
	}

	return nil
}