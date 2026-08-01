package service

import (
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
)

func TestAnonymizeAndDeanonymize(t *testing.T) {
	s := &metricsService{}

	originalAttempts := []models.FailedAuthAttempt{
		{
			IP:          "192.168.1.10",
			Actor:       "john.doe@example.com",
			FailCount:   5,
			LastAttempt: time.Now(),
		},
		{
			IP:          "192.168.1.20",
			Actor:       "jane.smith@example.com",
			FailCount:   3,
			LastAttempt: time.Now(),
		},
		{
			IP:          "192.168.1.10",
			Actor:       "john.doe@example.com",
			FailCount:   2,
			LastAttempt: time.Now(),
		},
	}

	anonAttempts, revMap := s.anonymizeAttempts(originalAttempts)

	// Verify anonymization
	if len(anonAttempts) != len(originalAttempts) {
		t.Fatalf("expected %d attempts, got %d",
			len(originalAttempts), len(anonAttempts))
	}

	for _, a := range anonAttempts {
		if a.IP == "192.168.1.10" || a.IP == "192.168.1.20" {
			t.Errorf("found original IP in anonymized data: %s", a.IP)
		}
		if a.Actor == "john.doe@example.com" ||
			a.Actor == "jane.smith@example.com" {
			t.Errorf("found original Actor in anonymized data: %s", a.Actor)
		}
	}

	// Verify reverse mapping keys
	if len(revMap) != 4 { // 2 distinct users + 2 distinct IPs
		t.Errorf("expected 4 mapping entries, got %d", len(revMap))
	}

	// Test deanonymize
	analysisResult := &models.SecurityAnalysisResult{
		ThreatLevel: "HIGH",
		Confidence:  0.9,
		Anomalies: []string{
			"Brute force from anon_ip_1 detected",
			"Multiple failed logins for anon_user_2",
		},
		Advisory: "Block access for anon_ip_1 and inspect anon_user_2 activity",
	}

	s.deanonymizeResult(analysisResult, revMap)

	// Verify original values are restored in anomalies
	expectedAnomaly1 := "Brute force from 192.168.1.10 detected"
	if analysisResult.Anomalies[0] != expectedAnomaly1 {
		t.Errorf("expected '%s', got '%s'",
			expectedAnomaly1, analysisResult.Anomalies[0])
	}

	expectedAnomaly2 := "Multiple failed logins for jane.smith@example.com"
	if analysisResult.Anomalies[1] != expectedAnomaly2 {
		t.Errorf("expected '%s', got '%s'",
			expectedAnomaly2, analysisResult.Anomalies[1])
	}

	// Verify original values are restored in advisory
	expectedAdvisory := "Block access for 192.168.1.10 and " +
		"inspect jane.smith@example.com activity"
	if analysisResult.Advisory != expectedAdvisory {
		t.Errorf("expected '%s', got '%s'",
			expectedAdvisory, analysisResult.Advisory)
	}
}
