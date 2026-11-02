// Package service provides domain services for the Identity Provider.
package service

import (
	"log"
	"net"
	"os"
	"strings"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/oschwald/geoip2-golang"
)

// LocationInfo contains resolved geographic telemetry for a client IP.
type LocationInfo struct {
	CountryCode string  `json:"country_code"`
	CountryName string  `json:"country_name"`
	City        string  `json:"city"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	IsPrivate   bool    `json:"is_private"`
}

// GeoIPService defines operations for IP geolocation resolution.
type GeoIPService interface {
	ResolveIP(ipStr, cfCountry string) (*LocationInfo, error)
	Close() error
}

type geoIPService struct {
	reader *geoip2.Reader
}

// NewGeoIPService creates a new GeoIP service instance.
func NewGeoIPService() GeoIPService {
	dbPath := os.Getenv("GEOIP_DB_PATH")
	candidates := []string{
		dbPath,
		"data/GeoLite2-City.mmdb",
		"/app/data/GeoLite2-City.mmdb",
		"backend/data/GeoLite2-City.mmdb",
	}

	var reader *geoip2.Reader
	for _, path := range candidates {
		if path == "" {
			continue
		}
		if _, err := os.Stat(path); err == nil {
			r, err := geoip2.Open(path)
			if err == nil {
				reader = r
				log.Printf("[GeoIPService] Loaded database from %s", path)
				break
			}
		}
	}

	if reader == nil {
		log.Println(
			"[GeoIPService] GeoIP DB not found; header fallback active",
		)
	}

	return &geoIPService{reader: reader}
}

// Close closes the underlying GeoIP database reader if open.
func (s *geoIPService) Close() error {
	if s.reader != nil {
		return s.reader.Close()
	}
	return nil
}

// ResolveIP resolves geographic telemetry for a given client IP address.
func (s *geoIPService) ResolveIP(
	ipStr string,
	cfCountry string,
) (*LocationInfo, error) {
	ipStr = strings.TrimSpace(ipStr)
	parsedIP := net.ParseIP(ipStr)

	// Treat loopback, LAN, or unparseable IPs as local Philippines
	if parsedIP == nil || utils.IsPrivateOrLoopbackIP(parsedIP) {
		return &LocationInfo{
			CountryCode: "PH",
			CountryName: "Philippines",
			City:        "Manila (Local)",
			Latitude:    14.5995,
			Longitude:   120.9842,
			IsPrivate:   true,
		}, nil
	}

	loc := &LocationInfo{
		CountryCode: "PH",
		CountryName: "Philippines",
		City:        "Unknown",
		Latitude:    14.5995,
		Longitude:   120.9842,
		IsPrivate:   false,
	}

	cfCountry = strings.TrimSpace(strings.ToUpper(cfCountry))
	if cfCountry != "" && cfCountry != "XX" && cfCountry != "T1" {
		loc.CountryCode = cfCountry
	}

	if s.reader != nil {
		record, err := s.reader.City(parsedIP)
		if err == nil {
			if record.Country.IsoCode != "" {
				loc.CountryCode = record.Country.IsoCode
				loc.CountryName = record.Country.Names["en"]
			}
			if cityName, ok := record.City.Names["en"]; ok && cityName != "" {
				loc.City = cityName
			}
			if record.Location.Latitude != 0 || record.Location.Longitude != 0 {
				loc.Latitude = record.Location.Latitude
				loc.Longitude = record.Location.Longitude
			}
		}
	}

	return loc, nil
}
