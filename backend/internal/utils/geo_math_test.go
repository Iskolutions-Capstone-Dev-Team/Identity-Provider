package utils

import (
	"math"
	"net"
	"testing"
)

func TestCalculateHaversineDistanceKm(t *testing.T) {
	// Manila: 14.5995, 120.9842
	// Tokyo: 35.6762, 139.6503
	// Expected distance: ~2,990 km
	dist := CalculateHaversineDistanceKm(
		14.5995, 120.9842,
		35.6762, 139.6503,
	)

	if math.Abs(dist-2990) > 50 {
		t.Fatalf("expected distance ~2990 km, got %.2f km", dist)
	}

	// Same point distance should be 0
	sameDist := CalculateHaversineDistanceKm(
		14.5995, 120.9842,
		14.5995, 120.9842,
	)
	if sameDist != 0 {
		t.Fatalf("expected 0 km for identical coordinates, got %.2f", sameDist)
	}
}

func TestCalculateTravelSpeedKmH(t *testing.T) {
	speed := CalculateTravelSpeedKmH(1000.0, 2.0)
	if speed != 500.0 {
		t.Fatalf("expected speed 500 km/h, got %.2f", speed)
	}

	zeroSpeed := CalculateTravelSpeedKmH(1000.0, 0)
	if zeroSpeed != 0 {
		t.Fatalf("expected 0 for zero duration, got %.2f", zeroSpeed)
	}
}

func TestIsImpossibleTravel(t *testing.T) {
	// Case 1: Distance >= 300km and Speed > 900km/h (e.g. 3000km in 10 mins)
	speed1 := CalculateTravelSpeedKmH(3000.0, 10.0/60.0) // 18,000 km/h
	if !IsImpossibleTravel(3000.0, speed1) {
		t.Fatalf("expected impossible travel for 3000km in 10m")
	}

	// Case 2: Realistic travel: 3000km in 5 hours (600 km/h)
	speed2 := CalculateTravelSpeedKmH(3000.0, 5.0)
	if IsImpossibleTravel(3000.0, speed2) {
		t.Fatalf("realistic travel of 600 km/h should NOT be impossible")
	}

	// Case 3: Short distance (ISP cell tower jump in Manila: 15km in 1s)
	speed3 := CalculateTravelSpeedKmH(15.0, 1.0/3600.0) // 54,000 km/h
	if IsImpossibleTravel(15.0, speed3) {
		t.Fatalf("short distance jump under 300km should NOT be impossible")
	}
}

func TestIsPrivateOrLoopbackIP(t *testing.T) {
	testCases := []struct {
		ip       string
		expected bool
	}{
		{"127.0.0.1", true},
		{"::1", true},
		{"10.0.4.15", true},
		{"172.20.0.2", true},
		{"192.168.1.100", true},
		{"8.8.8.8", false},
		{"1.1.1.1", false},
		{"203.0.113.195", false},
	}

	for _, tc := range testCases {
		parsed := net.ParseIP(tc.ip)
		actual := IsPrivateOrLoopbackIP(parsed)
		if actual != tc.expected {
			t.Errorf(
				"IP %s expected isPrivate=%v, got %v",
				tc.ip, tc.expected, actual,
			)
		}
	}
}
