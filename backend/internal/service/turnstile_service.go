// Package service provides domain services for the Identity Provider.
package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const turnstileVerifyURL = "https://challenges.cloudflare.com/" +
	"turnstile/v0/siteverify"

// TurnstileService validates Cloudflare Turnstile CAPTCHA tokens.
type TurnstileService interface {
	VerifyToken(ctx context.Context, token, clientIP string) (bool, error)
	GetSiteKey() string
}

type turnstileService struct {
	secretKey  string
	siteKey    string
	httpClient *http.Client
}

type turnstileVerifyResponse struct {
	Success     bool     `json:"success"`
	ErrorCodes  []string `json:"error-codes"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
}

// NewTurnstileService creates a new Turnstile verification service.
func NewTurnstileService() TurnstileService {
	secret := os.Getenv("CF_TURNSTILE_SECRET_KEY")
	site := os.Getenv("CF_TURNSTILE_SITE_KEY")

	return &turnstileService{
		secretKey: secret,
		siteKey:   site,
		httpClient: &http.Client{
			Timeout: 4 * time.Second,
		},
	}
}

// GetSiteKey returns the configured Turnstile public site key.
func (s *turnstileService) GetSiteKey() string {
	return s.siteKey
}

// VerifyToken verifies a Turnstile response token with Cloudflare API.
func (s *turnstileService) VerifyToken(
	ctx context.Context,
	token string,
	clientIP string,
) (bool, error) {
	token = strings.TrimSpace(token)
	if token == "" {
		return false, fmt.Errorf("token is empty")
	}

	// Bypass in development if secret key is omitted
	if s.secretKey == "" {
		log.Println("[Turnstile] CF_TURNSTILE_SECRET_KEY unset; bypassing")
		return true, nil
	}

	data := url.Values{}
	data.Set("secret", s.secretKey)
	data.Set("response", token)
	if clientIP != "" {
		data.Set("remoteip", clientIP)
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		turnstileVerifyURL,
		strings.NewReader(data.Encode()),
	)
	if err != nil {
		return false, fmt.Errorf("create verify request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return false, fmt.Errorf("do verify request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, fmt.Errorf("read verify response: %w", err)
	}

	var verifyResp turnstileVerifyResponse
	if err := json.Unmarshal(body, &verifyResp); err != nil {
		return false, fmt.Errorf("decode verify response: %w", err)
	}

	if !verifyResp.Success {
		log.Printf(
			"[Turnstile] Verification failed: %v",
			verifyResp.ErrorCodes,
		)
		return false, nil
	}

	return true, nil
}
