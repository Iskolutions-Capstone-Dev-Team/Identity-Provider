// Package utils provides utility and helper functions.
package utils

import (
	"math"
	"net"
)

// EarthRadiusKm represents the mean radius of Earth in kilometers.
const EarthRadiusKm = 6371.0

// MinSuspiciousDistanceKm defines the minimum distance to check for
// impossible travel velocity (ignores cellular tower IP switching).
const MinSuspiciousDistanceKm = 300.0

// MaxTravelSpeedKmH defines the maximum plausible human travel speed
// in kilometers per hour (standard commercial jetliner ceiling).
const MaxTravelSpeedKmH = 900.0

// degreesToRadians converts degrees to radians.
func degreesToRadians(degrees float64) float64 {
	return degrees * math.Pi / 180.0
}

// CalculateHaversineDistanceKm calculates the great-circle distance
// between two geographic coordinates in kilometers.
func CalculateHaversineDistanceKm(
	lat1, lon1, lat2, lon2 float64,
) float64 {
	dLat := degreesToRadians(lat2 - lat1)
	dLon := degreesToRadians(lon2 - lon1)

	rLat1 := degreesToRadians(lat1)
	rLat2 := degreesToRadians(lat2)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(rLat1)*math.Cos(rLat2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return EarthRadiusKm * c
}

// CalculateTravelSpeedKmH calculates travel velocity in km/h.
// If durationHours is non-positive, returns 0.
func CalculateTravelSpeedKmH(
	distanceKm float64,
	durationHours float64,
) float64 {
	if durationHours <= 0 {
		return 0
	}
	return distanceKm / durationHours
}

// IsImpossibleTravel evaluates whether the speed and distance indicate
// an impossible physical location switch.
func IsImpossibleTravel(distanceKm, speedKmH float64) bool {
	return distanceKm >= MinSuspiciousDistanceKm &&
		speedKmH > MaxTravelSpeedKmH
}

// IsPrivateOrLoopbackIP checks if an IP is loopback, link-local,
// or belongs to an RFC 1918 private network.
func IsPrivateOrLoopbackIP(ip net.IP) bool {
	if ip == nil {
		return true
	}

	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}

	// RFC 1918 / Private network blocks
	privateCIDRs := []string{
		"10.0.0.0/8",
		"172.16.0.0/12",
		"192.168.0.0/16",
		"fc00::/7",
	}

	for _, cidr := range privateCIDRs {
		_, block, err := net.ParseCIDR(cidr)
		if err == nil && block.Contains(ip) {
			return true
		}
	}

	return false
}
