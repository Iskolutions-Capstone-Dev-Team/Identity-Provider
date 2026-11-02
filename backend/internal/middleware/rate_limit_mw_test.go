package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestLimiterStore_AllowMemory(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Burst 2, interval 100ms
	store := NewLimiterStore(nil, 100*time.Millisecond, 2)

	ctx := context.Background()
	key := "test:client1"

	if !store.Allow(ctx, key) {
		t.Fatalf("first request should be allowed")
	}
	if !store.Allow(ctx, key) {
		t.Fatalf("second request should be allowed")
	}
	if store.Allow(ctx, key) {
		t.Fatalf("third request within burst should be blocked")
	}

	// Wait for replenishment
	time.Sleep(120 * time.Millisecond)
	if !store.Allow(ctx, key) {
		t.Fatalf("request after replenishment should be allowed")
	}
}

func TestLimiterStore_UserIsolationOnSameNAT(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Burst 2 per user
	store := NewLimiterStore(nil, 1*time.Second, 2)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		if uid := c.GetHeader("X-User-ID"); uid != "" {
			c.Set("user_id", uid)
		}
		c.Next()
	})
	r.Use(RateLimitWithKey(store, UserKeyExtractor))
	r.GET("/protected", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	// User 1 makes 2 requests (exhausts burst)
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("X-Forwarded-For", "203.0.113.1")
		req.Header.Set("X-User-ID", "user-uuid-1")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("user 1 request %d expected 200, got %d", i+1, w.Code)
		}
	}

	// User 1 third request should be 429
	{
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("X-Forwarded-For", "203.0.113.1")
		req.Header.Set("X-User-ID", "user-uuid-1")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusTooManyRequests {
			t.Fatalf("user 1 3rd request expected 429, got %d", w.Code)
		}
	}

	// User 2 on the SAME IP address (NAT) must NOT be blocked!
	{
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("X-Forwarded-For", "203.0.113.1")
		req.Header.Set("X-User-ID", "user-uuid-2")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf(
				"user 2 on same NAT IP expected 200, got %d",
				w.Code,
			)
		}
	}
}

func TestLimiterStore_TargetEmailKeyExtractor(t *testing.T) {
	gin.SetMode(gin.TestMode)

	store := NewLimiterStore(nil, 1*time.Second, 1)

	r := gin.New()
	r.Use(RateLimitWithKey(store, TargetEmailKeyExtractor))
	r.GET("/otp/send", func(c *gin.Context) {
		c.String(http.StatusOK, "sent")
	})

	// Student A requests OTP from campus NAT
	req1 := httptest.NewRequest(
		http.MethodGet,
		"/otp/send?email=studentA@school.edu",
		nil,
	)
	req1.Header.Set("X-Forwarded-For", "198.51.100.1")
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	if w1.Code != http.StatusOK {
		t.Fatalf("student A first request expected 200, got %d", w1.Code)
	}

	// Student A immediate second request should get 429
	req2 := httptest.NewRequest(
		http.MethodGet,
		"/otp/send?email=studentA@school.edu",
		nil,
	)
	req2.Header.Set("X-Forwarded-For", "198.51.100.1")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusTooManyRequests {
		t.Fatalf("student A second request expected 429, got %d", w2.Code)
	}

	// Student B on the SAME campus NAT should succeed!
	req3 := httptest.NewRequest(
		http.MethodGet,
		"/otp/send?email=studentB@school.edu",
		nil,
	)
	req3.Header.Set("X-Forwarded-For", "198.51.100.1")
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)
	if w3.Code != http.StatusOK {
		t.Fatalf("student B on same NAT expected 200, got %d", w3.Code)
	}
}
