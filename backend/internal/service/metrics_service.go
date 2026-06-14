package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
)

type MetricsService interface {
	GetDashboardMetrics(ctx context.Context) (*models.DashboardMetrics, error)
}

type metricsService struct {
	repo       repository.MetricsRepository
	cache      cache.Cache
	apiKey     string
	mu         sync.RWMutex
	lastResult models.SecurityAnalysisResult
}

type geminiRequest struct {
	Contents         []geminiContent `json:"contents"`
	GenerationConfig geminiConfig    `json:"generationConfig"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type geminiConfig struct {
	ResponseMIMEType string        `json:"responseMimeType"`
	ResponseSchema   *geminiSchema `json:"responseSchema,omitempty"`
}

type geminiSchema struct {
	Type       string                   `json:"type"`
	Properties map[string]*geminiSchema `json:"properties,omitempty"`
	Required   []string                 `json:"required,omitempty"`
	Items      *geminiSchema            `json:"items,omitempty"`
	Enum       []string                 `json:"enum,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func NewMetricsService(
	repo repository.MetricsRepository,
	c cache.Cache,
) MetricsService {
	apiKey := os.Getenv("GEMINI_API_KEY")
	s := &metricsService{
		repo:   repo,
		cache:  c,
		apiKey: apiKey,
		lastResult: models.SecurityAnalysisResult{
			ThreatLevel: "UNKNOWN",
			Confidence:  0.0,
			Anomalies:   []string{"Analysis has not run yet"},
			Advisory:    "Background analyzer is starting up.",
			AnalyzedAt:  time.Now(),
		},
	}

	go s.runBackgroundAnalyzer(context.Background())
	return s
}

func (s *metricsService) runBackgroundAnalyzer(ctx context.Context) {
	ticker := time.NewTicker(15 * time.Minute)
	defer ticker.Stop()

	// Initial run
	s.performAnalysis(ctx)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.performAnalysis(ctx)
		}
	}
}

func (s *metricsService) performAnalysis(ctx context.Context) {
	if s.apiKey == "" {
		s.mu.Lock()
		s.lastResult = models.SecurityAnalysisResult{
			ThreatLevel: "UNKNOWN",
			Confidence:  0.0,
			Anomalies:   []string{"Gemini API Key is not configured"},
			Advisory:    "Please set GEMINI_API_KEY in the environment config.",
			AnalyzedAt:  time.Now(),
		}
		s.mu.Unlock()
		return
	}

	// Check Redis cache first to avoid rate limiting
	cacheKey := "metrics:security_analysis"
	if cachedVal, ok, err := s.cache.Get(ctx, cacheKey); err == nil && ok {
		var cachedResult models.SecurityAnalysisResult
		if err := json.Unmarshal([]byte(cachedVal), &cachedResult); err == nil {
			s.mu.Lock()
			s.lastResult = cachedResult
			s.mu.Unlock()
			return
		}
	}

	since := time.Now().Add(-1 * time.Hour)
	successCount, err := s.repo.GetTotalLogins(ctx, since)
	if err != nil {
		log.Printf("[MetricsService] GetTotalLogins error: %v", err)
		return
	}

	failedAttempts, err := s.repo.GetFailedAuthAttempts(ctx, since)
	if err != nil {
		log.Printf("[MetricsService] GetFailedAuthAttempts error: %v", err)
		return
	}

	topClients, err := s.repo.GetTopClients(ctx, 5)
	if err != nil {
		log.Printf("[MetricsService] GetTopClients error: %v", err)
		return
	}

	failCount := 0
	for _, a := range failedAttempts {
		failCount += a.FailCount
	}

	topClientsJSON, _ := json.Marshal(topClients)
	attemptsJSON, _ := json.Marshal(failedAttempts)

	result, err := s.callGeminiAPI(
		ctx, successCount, failCount,
		string(topClientsJSON), string(attemptsJSON),
	)
	if err != nil {
		log.Printf("[MetricsService] callGeminiAPI error: %v", err)
		return
	}

	result.AnalyzedAt = time.Now()

	s.mu.Lock()
	s.lastResult = result
	s.mu.Unlock()

	resultJSON, _ := json.Marshal(result)
	_ = s.cache.Set(ctx, cacheKey, string(resultJSON), 30*time.Minute)
}

func (s *metricsService) callGeminiAPI(
	ctx context.Context, success int, fail int,
	topClients string, attempts string,
) (models.SecurityAnalysisResult, error) {
	baseURL := os.Getenv("GEMINI_BASE_URL")
	if baseURL == "" {
		baseURL = "https://generativelanguage.googleapis.com"
	}
	url := fmt.Sprintf(
		"%s/v1beta/models/gemini-1.5-flash:generateContent?key=%s",
		baseURL,
		s.apiKey,
	)

	prompt := fmt.Sprintf(
		"Analyze authentication metrics for threats like brute force or DDoS.\n"+
			"Success Logins: %d\nFailed Logins: %d\n"+
			"Top Clients: %s\nFailed Attempts: %s",
		success, fail, topClients, attempts,
	)

	reqPayload := geminiRequest{
		Contents: []geminiContent{
			{
				Parts: []geminiPart{
					{Text: prompt},
				},
			},
		},
		GenerationConfig: geminiConfig{
			ResponseMIMEType: "application/json",
			ResponseSchema: &geminiSchema{
				Type: "OBJECT",
				Properties: map[string]*geminiSchema{
					"threat_level": {
						Type: "STRING",
						Enum: []string{"LOW", "MEDIUM", "HIGH"},
					},
					"confidence": {Type: "NUMBER"},
					"anomalies": {
						Type:  "ARRAY",
						Items: &geminiSchema{Type: "STRING"},
					},
					"advisory": {Type: "STRING"},
				},
				Required: []string{
					"threat_level", "confidence", "anomalies", "advisory",
				},
			},
		},
	}

	bodyBytes, err := json.Marshal(reqPayload)
	if err != nil {
		return models.SecurityAnalysisResult{}, err
	}

	req, err := http.NewRequestWithContext(
		ctx, "POST", url, bytes.NewReader(bodyBytes),
	)
	if err != nil {
		return models.SecurityAnalysisResult{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return models.SecurityAnalysisResult{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return models.SecurityAnalysisResult{}, fmt.Errorf(
			"gemini api returned status %d: %v", resp.StatusCode, errResp)
	}

	var geminiResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return models.SecurityAnalysisResult{}, err
	}

	if len(geminiResp.Candidates) == 0 ||
		len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return models.SecurityAnalysisResult{}, fmt.Errorf(
			"empty gemini response candidates")
	}

	responseText := geminiResp.Candidates[0].Content.Parts[0].Text

	var result models.SecurityAnalysisResult
	if err := json.Unmarshal([]byte(responseText), &result); err != nil {
		return models.SecurityAnalysisResult{}, fmt.Errorf(
			"failed to parse gemini response JSON: %w (raw response: %s)",
			err, responseText)
	}

	return result, nil
}

func (s *metricsService) GetDashboardMetrics(
	ctx context.Context,
) (*models.DashboardMetrics, error) {
	now := time.Now()

	// Today start
	todayStart := time.Date(
		now.Year(), now.Month(), now.Day(),
		0, 0, 0, 0, now.Location(),
	)

	// This week start (Monday)
	daysSinceMonday := int(now.Weekday()) - 1
	if daysSinceMonday < 0 {
		daysSinceMonday = 6
	}
	weekStart := todayStart.AddDate(0, 0, -daysSinceMonday)

	// This month start
	monthStart := time.Date(
		now.Year(), now.Month(), 1,
		0, 0, 0, 0, now.Location(),
	)

	todayCount, err := s.repo.GetTotalLogins(ctx, todayStart)
	if err != nil {
		return nil, err
	}

	weekCount, err := s.repo.GetTotalLogins(ctx, weekStart)
	if err != nil {
		return nil, err
	}

	monthCount, err := s.repo.GetTotalLogins(ctx, monthStart)
	if err != nil {
		return nil, err
	}

	topClients, err := s.repo.GetTopClients(ctx, 10)
	if err != nil {
		return nil, err
	}

	s.mu.RLock()
	analysis := s.lastResult
	s.mu.RUnlock()

	// If cache has a newer result, use it
	if cachedVal, ok, err := s.cache.Get(
		ctx, "metrics:security_analysis",
	); err == nil && ok {
		var cachedResult models.SecurityAnalysisResult
		if err := json.Unmarshal([]byte(cachedVal), &cachedResult); err == nil {
			analysis = cachedResult
		}
	}

	return &models.DashboardMetrics{
		LoginStats: models.LoginStats{
			Today:     todayCount,
			ThisWeek:  weekCount,
			ThisMonth: monthCount,
		},
		TopClients:       topClients,
		SecurityAnalysis: analysis,
	}, nil
}
