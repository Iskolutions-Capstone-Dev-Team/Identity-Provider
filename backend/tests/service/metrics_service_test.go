package service_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/service"
	"github.com/google/uuid"
)

type mockMetricsRepository struct {
	TotalLogins int
	TopClients  []models.TopClientLogin
	Failed      []models.FailedAuthAttempt
}

func (m *mockMetricsRepository) GetTotalLogins(
	ctx context.Context, since time.Time, allowedClients []string,
) (int, error) {
	return m.TotalLogins, nil
}

func (m *mockMetricsRepository) GetTopClients(
	ctx context.Context, limit int, since time.Time, allowedClients []string,
) ([]models.TopClientLogin, error) {
	return m.TopClients, nil
}

func (m *mockMetricsRepository) GetFailedAuthAttempts(
	ctx context.Context, since time.Time, allowedClients []string,
) ([]models.FailedAuthAttempt, error) {
	return m.Failed, nil
}

func (m *mockMetricsRepository) GetBoundClientIDs(
	ctx context.Context, userID []byte,
) ([]string, error) {
	return []string{"id-1"}, nil
}

func (m *mockMetricsRepository) GetClientMetrics(
	ctx context.Context, allowedClients []string,
) ([]models.MetricCard, error) {
	return []models.MetricCard{}, nil
}

func (m *mockMetricsRepository) GetRoleMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	return []models.MetricCard{}, nil
}

func (m *mockMetricsRepository) GetUserMetrics(
	ctx context.Context, adminID []byte,
) ([]models.MetricCard, error) {
	return []models.MetricCard{}, nil
}

func (m *mockMetricsRepository) GetLogMetrics(
	ctx context.Context, hasAudit, hasSecurity bool,
) ([]models.MetricCard, error) {
	return []models.MetricCard{}, nil
}

func (m *mockMetricsRepository) GetPermissionMetrics(
	ctx context.Context,
) ([]models.MetricCard, error) {
	return []models.MetricCard{}, nil
}

func (m *mockMetricsRepository) GetRegistrationMetrics(
	ctx context.Context, allowedClients []string,
) ([]models.MetricCard, error) {
	return []models.MetricCard{}, nil
}

type mockCache struct {
	mu      sync.Mutex
	store   map[string]string
	setChan chan string
}

func (c *mockCache) Set(
	ctx context.Context, key, val string, ttl time.Duration,
) error {
	c.mu.Lock()
	c.store[key] = val
	c.mu.Unlock()
	if c.setChan != nil && key == "metrics:security_analysis" {
		select {
		case c.setChan <- val:
		default:
		}
	}
	return nil
}

func (c *mockCache) Get(
	ctx context.Context, key string,
) (string, bool, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	val, ok := c.store[key]
	return val, ok, nil
}

func (c *mockCache) Delete(ctx context.Context, key string) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.store, key)
	return nil
}

func (c *mockCache) Incr(ctx context.Context, key string) (int64, error) {
	return 0, nil
}

func TestGetDashboardMetrics(t *testing.T) {
	repo := &mockMetricsRepository{
		TotalLogins: 42,
		TopClients: []models.TopClientLogin{
			{ClientID: "id-1", ClientName: "App 1", LoginCount: 30},
		},
		Failed: []models.FailedAuthAttempt{
			{IP: "1.1.1.1", Actor: "user1", FailCount: 3},
		},
	}

	cache := &mockCache{store: make(map[string]string)}

	// Pre-populate cache with a threat analysis result
	analysis := models.SecurityAnalysisResult{
		ThreatLevel: "LOW",
		Confidence:  0.9,
		Anomalies:   []string{"none"},
		Advisory:    "All clear",
		AnalyzedAt:  time.Now(),
	}
	analysisJSON, _ := json.Marshal(analysis)
	_ = cache.Set(
		context.Background(),
		"metrics:security_analysis",
		string(analysisJSON),
		30*time.Minute,
	)

	svc := service.NewMetricsService(repo, cache, nil)

	metrics, err := svc.GetDashboardMetrics(
		context.Background(),
		uuid.New(),
		[]string{"View all appclients"},
	)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if metrics.LoginStats.Today.Count != 42 {
		t.Errorf(
			"expected 42 today logins, got %d",
			metrics.LoginStats.Today.Count,
		)
	}

	if len(metrics.LoginStats.Today.TopClients) != 1 ||
		metrics.LoginStats.Today.TopClients[0].ClientName != "App 1" {
		t.Errorf(
			"unexpected top clients: %v",
			metrics.LoginStats.Today.TopClients,
		)
	}

	if metrics.SecurityAnalysis.ThreatLevel != "LOW" {
		t.Errorf(
			"expected threat level LOW, got %s",
			metrics.SecurityAnalysis.ThreatLevel,
		)
	}

	// Test with restricted permissions
	metricsRestricted, err := svc.GetDashboardMetrics(
		context.Background(),
		uuid.New(),
		[]string{"View connected appclients"},
	)
	if err != nil {
		t.Fatalf("expected no error for restricted user, got %v", err)
	}
	if metricsRestricted.LoginStats.Today.Count != 42 {
		t.Errorf(
			"expected 42 today logins for restricted, got %d",
			metricsRestricted.LoginStats.Today.Count,
		)
	}
}

type localGeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func TestPerformAnalysisWithGemini(t *testing.T) {
	// Setup test server to mock Gemini API
	server := httptest.NewServer(http.HandlerFunc(func(
		w http.ResponseWriter, r *http.Request,
	) {
		w.Header().Set("Content-Type", "application/json")
		response := localGeminiResponse{
			Candidates: []struct {
				Content struct {
					Parts []struct {
						Text string `json:"text"`
					} `json:"parts"`
				} `json:"content"`
			}{
				{
					Content: struct {
						Parts []struct {
							Text string `json:"text"`
						} `json:"parts"`
					}{
						Parts: []struct {
							Text string `json:"text"`
						}{
							{
								Text: `{"threat_level":"HIGH",` +
									`"confidence":0.95,` +
									`"anomalies":["brute force"],` +
									`"advisory":"Block IPs"}`,
							},
						},
					},
				},
			},
		}
		_ = json.NewEncoder(w).Encode(response)
	}))
	defer server.Close()

	// Configure environment variables before instantiating the service
	t.Setenv("GEMINI_BASE_URL", server.URL)
	t.Setenv("GEMINI_API_KEY", "test-api-key")

	repo := &mockMetricsRepository{
		TotalLogins: 10,
		TopClients:  []models.TopClientLogin{},
		Failed: []models.FailedAuthAttempt{
			{IP: "2.2.2.2", Actor: "admin", FailCount: 50},
		},
	}

	setChan := make(chan string, 1)
	cache := &mockCache{
		store:   make(map[string]string),
		setChan: setChan,
	}

	_ = service.NewMetricsService(repo, cache, nil)

	// Wait for the background goroutine to complete its performAnalysis run
	select {
	case <-setChan:
		// Success
	case <-time.After(3 * time.Second):
		t.Fatal("timed out waiting for gemini background analyzer")
	}

	metrics, _, err := cache.Get(
		context.Background(),
		"metrics:security_analysis",
	)
	if err != nil {
		t.Fatalf("failed to get metrics from cache: %v", err)
	}

	var result models.SecurityAnalysisResult
	if err := json.Unmarshal([]byte(metrics), &result); err != nil {
		t.Fatalf("failed to unmarshal cached metrics: %v", err)
	}

	if result.ThreatLevel != "HIGH" {
		t.Errorf("expected HIGH threat, got %s", result.ThreatLevel)
	}

	if len(result.Anomalies) != 1 ||
		result.Anomalies[0] != "brute force" {
		t.Errorf("unexpected anomalies: %v", result.Anomalies)
	}
}

func TestGenerateReportPDF(t *testing.T) {
	repo := &mockMetricsRepository{
		TotalLogins: 42,
		TopClients: []models.TopClientLogin{
			{ClientID: "id-1", ClientName: "App 1", LoginCount: 30},
		},
		Failed: []models.FailedAuthAttempt{
			{
				IP:          "1.1.1.1",
				Actor:       "user1",
				FailCount:   3,
				LastAttempt: time.Now(),
			},
		},
	}

	cache := &mockCache{store: make(map[string]string)}

	svc := service.NewMetricsService(repo, cache, nil)

	pdfBytes, err := svc.GenerateReportPDF(
		context.Background(),
		uuid.New(),
		[]string{"View all appclients"},
	)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(pdfBytes) == 0 {
		t.Error("expected non-empty PDF bytes")
	}
}

func TestGetGroupMetrics(t *testing.T) {
	repo := &mockMetricsRepository{}
	cache := &mockCache{store: make(map[string]string)}
	svc := service.NewMetricsService(repo, cache, nil)

	ctx := context.Background()

	perms := []string{"View all appclients", "View all users"}
	uID := uuid.New()

	if _, err := svc.GetClientMetrics(ctx, perms, uID); err != nil {
		t.Errorf("GetClientMetrics failed: %v", err)
	}
	if _, err := svc.GetRoleMetrics(ctx); err != nil {
		t.Errorf("GetRoleMetrics failed: %v", err)
	}
	if _, err := svc.GetUserMetrics(ctx, perms, uID); err != nil {
		t.Errorf("GetUserMetrics failed: %v", err)
	}
	if _, err := svc.GetLogMetrics(ctx, perms); err != nil {
		t.Errorf("GetLogMetrics failed: %v", err)
	}
	if _, err := svc.GetPermissionMetrics(ctx); err != nil {
		t.Errorf("GetPermissionMetrics failed: %v", err)
	}
	if _, err := svc.GetRegistrationMetrics(ctx, perms, uID); err != nil {
		t.Errorf("GetRegistrationMetrics failed: %v", err)
	}
}
