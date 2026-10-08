package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/telemetry"
	"github.com/stretchr/testify/assert"
)

func TestTelemetryCollectorRecordAndGet(t *testing.T) {
	collector := telemetry.NewTelemetryCollector()
	collector.RecordRequest(50 * time.Millisecond)
	collector.RecordRequest(150 * time.Millisecond)

	telemetryData := collector.GetTelemetry(
		context.Background(),
		nil,
		nil,
	)

	assert.Equal(t, "Healthy", telemetryData.SystemHealth)
	assert.Equal(t, "Operational", telemetryData.CacheStatus)
	assert.GreaterOrEqual(t, telemetryData.AvgLatencyMs, 0.0)
	assert.GreaterOrEqual(t, telemetryData.CPULoadPercent, 0.0)
	assert.GreaterOrEqual(t, telemetryData.MemoryUsageMB, 0.0)
}
