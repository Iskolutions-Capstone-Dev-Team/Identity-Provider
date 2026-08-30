package v1

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/cache"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

type HealthHandler struct {
	DB      *sqlx.DB
	Cache   cache.Cache
	Storage *storage.S3Provider
}

func NewHealthHandler(
	db *sqlx.DB,
	appCache cache.Cache,
	store *storage.S3Provider,
) *HealthHandler {
	return &HealthHandler{
		DB:      db,
		Cache:   appCache,
		Storage: store,
	}
}

func (h *HealthHandler) GetHealth(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
	defer cancel()

	overallStatus := "healthy"
	statusCode := http.StatusOK

	// 1. Check Database
	dbStatus := "healthy"
	var dbErr string
	if h.DB != nil {
		if err := h.DB.PingContext(ctx); err != nil {
			dbStatus = "unhealthy"
			dbErr = err.Error()
			overallStatus = "unhealthy"
			statusCode = http.StatusServiceUnavailable
		}
	} else {
		dbStatus = "unhealthy"
		dbErr = "database connection not initialized"
		overallStatus = "unhealthy"
		statusCode = http.StatusServiceUnavailable
	}

	// 2. Check Cache
	cacheStatus := "healthy"
	var cacheErr string
	if h.Cache != nil {
		testKey := "health_check_test_key"
		if err := h.Cache.Set(ctx, testKey, "ok", 5*time.Second); err != nil {
			cacheStatus = "unhealthy"
			cacheErr = err.Error()
			if overallStatus != "unhealthy" {
				overallStatus = "degraded"
			}
		} else {
			val, ok, err := h.Cache.Get(ctx, testKey)
			if err != nil {
				cacheStatus = "unhealthy"
				cacheErr = err.Error()
				if overallStatus != "unhealthy" {
					overallStatus = "degraded"
				}
			} else if !ok || val != "ok" {
				cacheStatus = "degraded"
				cacheErr = "cache read back mismatch"
				if overallStatus != "unhealthy" {
					overallStatus = "degraded"
				}
			} else {
				_ = h.Cache.Delete(ctx, testKey)
			}
		}
	} else {
		cacheStatus = "unhealthy"
		cacheErr = "cache client not initialized"
		if overallStatus != "unhealthy" {
			overallStatus = "degraded"
		}
	}

	// 3. Check Storage (S3)
	storageStatus := "healthy"
	var storageErr string
	if h.Storage != nil && h.Storage.Client != nil {
		exists, err := h.Storage.Client.BucketExists(
			ctx,
			h.Storage.BucketName,
		)
		if err != nil {
			storageStatus = "unhealthy"
			storageErr = err.Error()
			if overallStatus != "unhealthy" {
				overallStatus = "degraded"
			}
		} else if !exists {
			storageStatus = "unhealthy"
			storageErr = fmt.Sprintf(
				"bucket %s does not exist",
				h.Storage.BucketName,
			)
			if overallStatus != "unhealthy" {
				overallStatus = "degraded"
			}
		}
	} else {
		storageStatus = "unhealthy"
		storageErr = "storage provider not initialized"
		if overallStatus != "unhealthy" {
			overallStatus = "degraded"
		}
	}

	// 4. System stats (load, memory)
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)
	allocMB := float64(mem.Alloc) / 1024 / 1024

	cpuCount := runtime.NumCPU()
	load1 := 0.0
	isHeavyLoad := false

	loadData, err := os.ReadFile("/proc/loadavg")
	if err == nil {
		_, _ = fmt.Sscanf(string(loadData), "%f", &load1)
		if load1 > float64(cpuCount)*1.5 {
			isHeavyLoad = true
			if overallStatus == "healthy" {
				overallStatus = "degraded"
			}
		}
	}

	c.JSON(statusCode, gin.H{
		"status": overallStatus,
		"checks": gin.H{
			"database": gin.H{
				"status": dbStatus,
				"error":  dbErr,
			},
			"cache": gin.H{
				"status": cacheStatus,
				"error":  cacheErr,
			},
			"storage": gin.H{
				"status": storageStatus,
				"error":  storageErr,
			},
		},
		"system": gin.H{
			"load_average_1m":     load1,
			"heavy_load":          isHeavyLoad,
			"memory_allocated_mb": allocMB,
			"cpu_count":           cpuCount,
		},
	})
}
