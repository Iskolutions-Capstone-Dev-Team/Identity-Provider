package service

import (
	"testing"
)

func TestGeoIPService_ResolveLocalAndPrivate(t *testing.T) {
	svc := NewGeoIPService()
	defer svc.Close()

	// 1. Loopback IP should resolve to Philippines local
	loc1, err := svc.ResolveIP("127.0.0.1", "")
	if err != nil {
		t.Fatalf("unexpected error for loopback: %v", err)
	}
	if loc1.CountryCode != "PH" || !loc1.IsPrivate {
		t.Fatalf("expected PH private, got %s (private: %v)",
			loc1.CountryCode, loc1.IsPrivate)
	}

	// 2. RFC 1918 Private IP should resolve to Philippines local
	loc2, err := svc.ResolveIP("192.168.1.50", "")
	if err != nil {
		t.Fatalf("unexpected error for private IP: %v", err)
	}
	if loc2.CountryCode != "PH" || !loc2.IsPrivate {
		t.Fatalf("expected PH private, got %s (private: %v)",
			loc2.CountryCode, loc2.IsPrivate)
	}
}

func TestGeoIPService_CloudflareHeaderFallback(t *testing.T) {
	svc := NewGeoIPService()
	defer svc.Close()

	// Public IP with Cloudflare country header "US"
	loc, err := svc.ResolveIP("8.8.8.8", "US")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if loc.CountryCode != "US" {
		t.Fatalf("expected US country from header, got %s", loc.CountryCode)
	}
	if loc.IsPrivate {
		t.Fatalf("expected public IP, got private")
	}
}
