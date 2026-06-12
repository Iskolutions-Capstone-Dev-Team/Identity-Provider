package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/google/uuid"
)

// PasskeyUser implements webauthn.User for a given user record.
type PasskeyUser struct {
	id          []byte
	name        string
	displayName string
	credentials []webauthn.Credential
}

func (u *PasskeyUser) WebAuthnID() []byte   { return u.id }
func (u *PasskeyUser) WebAuthnName() string { return u.name }
func (u *PasskeyUser) WebAuthnDisplayName() string {
	return u.displayName
}
func (u *PasskeyUser) WebAuthnCredentials() []webauthn.Credential {
	return u.credentials
}

type PasskeyService interface {
	BeginRegistration(
		ctx context.Context, email string, platformAvailable bool,
		r *http.Request,
	) ([]byte, error)
	FinishRegistration(
		ctx context.Context, email string, r *http.Request,
	) error
	BeginVerification(
		ctx context.Context, email string, platformAvailable bool,
		r *http.Request,
	) ([]byte, error)
	FinishVerification(
		ctx context.Context, email string, r *http.Request,
	) error
	// HasPasskey reports whether the user has a registered passkey.
	HasPasskey(ctx context.Context, email string) (bool, error)
}

type passkeyService struct {
	wa          *webauthn.WebAuthn
	passkeyRepo repository.PasskeyRepository
	userService UserService
	// sessions maps email → *webauthn.SessionData for challenge storage.
	sessions sync.Map
}

// rpidFromURL extracts the hostname from a URL string for use as RPID.
func rpidFromURL(rawURL string) string {
	parsed, err := url.Parse(rawURL)
	if err != nil || parsed.Hostname() == "" {
		return rawURL
	}
	return parsed.Hostname()
}

// NewPasskeyService constructs a PasskeyService using CLIENT_BASE_URL
// as both the WebAuthn origin and the source of the RPID, along with
// allowed client origins from the database.
func NewPasskeyService(
	pr repository.PasskeyRepository,
	us UserService,
	cr repository.ClientRepository,
) (PasskeyService, error) {
	origin := os.Getenv("CLIENT_BASE_URL")
	originsMap := make(map[string]bool)

	// Fetch One Portal client to support its origins and fallback
	clients, err := cr.ListClients(
		context.Background(), 10, 0, "One Portal",
	)
	if err == nil {
		for _, c := range clients {
			if strings.EqualFold(c.ClientName, "One Portal") {
				if origin == "" {
					if c.OnePortalLink != nil && *c.OnePortalLink != "" {
						origin = *c.OnePortalLink
					} else if c.BaseUrl != "" {
						origin = c.BaseUrl
					}
				}
				// Add both URLs to allowed origins
				urls := []string{c.BaseUrl}
				if c.OnePortalLink != nil && *c.OnePortalLink != "" {
					urls = append(urls, *c.OnePortalLink)
				}
				for _, u := range urls {
					if u == "" {
						continue
					}
					parsed, err := url.Parse(u)
					if err != nil || parsed.Host == "" {
						continue
					}
					scheme := parsed.Scheme
					if scheme == "" {
						scheme = "http"
					}
					orig := fmt.Sprintf("%s://%s", scheme, parsed.Host)
					originsMap[orig] = true
				}
			}
		}
	}

	if origin == "" {
		envOP := os.Getenv("VITE_ONE_PORTAL_URL")
		if envOP != "" {
			origin = envOP
		}
	}

	if origin == "" {
		return nil, fmt.Errorf(
			"[PasskeyService] Init: CLIENT_BASE_URL is not set",
		)
	}

	rpid := rpidFromURL(origin)
	origin = strings.TrimRight(origin, "/")
	originsMap[origin] = true

	// Query other allowed client origins from DB
	dbURLS, err := cr.ListClientBaseURLS(context.Background())
	if err == nil {
		for _, u := range dbURLS {
			parsed, err := url.Parse(u)
			if err != nil || parsed.Host == "" {
				continue
			}
			scheme := parsed.Scheme
			if scheme == "" {
				scheme = "http"
			}
			orig := fmt.Sprintf("%s://%s", scheme, parsed.Host)
			originsMap[orig] = true
		}
	}

	var origins []string
	for o := range originsMap {
		origins = append(origins, o)
	}

	requireRK := true
	wa, err := webauthn.New(&webauthn.Config{
		RPDisplayName: "Identity Provider",
		RPID:          rpid,
		RPOrigins:     origins,
		AuthenticatorSelection: protocol.AuthenticatorSelection{
			RequireResidentKey: &requireRK,
			ResidentKey:        protocol.ResidentKeyRequirementRequired,
			UserVerification:   protocol.VerificationPreferred,
		},
	})
	if err != nil {
		return nil, fmt.Errorf(
			"[PasskeyService] Init: %w", err,
		)
	}

	return &passkeyService{
		wa:          wa,
		passkeyRepo: pr,
		userService: us,
	}, nil
}

// buildPasskeyUser loads a user and their existing passkeys, then
// returns a PasskeyUser suitable for the webauthn library calls.
func (s *passkeyService) buildPasskeyUser(
	ctx context.Context, email string,
) (*PasskeyUser, error) {
	user, err := s.userService.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf(
			"[PasskeyService] User Lookup: %w", err,
		)
	}

	uid, err := uuid.Parse(user.ID)
	if err != nil {
		return nil, fmt.Errorf(
			"[PasskeyService] UUID Parse: %w", err,
		)
	}

	stored, err := s.passkeyRepo.GetPasskeysByUserID(ctx, uid[:])
	if err != nil {
		return nil, fmt.Errorf(
			"[PasskeyService] Fetch Passkeys: %w", err,
		)
	}

	creds := make([]webauthn.Credential, 0, len(stored))
	for _, pk := range stored {
		creds = append(creds, webauthn.Credential{
			ID:        pk.CredentialID,
			PublicKey: pk.PublicKey,
			Flags: webauthn.CredentialFlags{
				BackupEligible: pk.BackupEligible,
				BackupState:    pk.BackupState,
			},
			Authenticator: webauthn.Authenticator{
				SignCount: pk.SignCount,
			},
		})
	}

	displayName := strings.TrimSpace(
		user.FirstName + " " + user.LastName,
	)
	if displayName == "" {
		displayName = user.Email
	}

	return &PasskeyUser{
		id:          uid[:],
		name:        user.Email,
		displayName: displayName,
		credentials: creds,
	}, nil
}

// BeginRegistration generates a WebAuthn registration challenge.
func (s *passkeyService) BeginRegistration(
	ctx context.Context, email string, platformAvailable bool,
	r *http.Request,
) ([]byte, error) {
	pu, err := s.buildPasskeyUser(ctx, email)
	if err != nil {
		return nil, err
	}

	var opts []webauthn.RegistrationOption
	if platformAvailable {
		requireRK := true
		opts = append(opts, webauthn.WithAuthenticatorSelection(
			protocol.AuthenticatorSelection{
				AuthenticatorAttachment: protocol.Platform,
				RequireResidentKey:      &requireRK,
				ResidentKey:             protocol.ResidentKeyRequirementRequired,
				UserVerification:        protocol.VerificationPreferred,
			},
		))
	}

	rpid := rpidFromRequest(r)
	wa, err := s.getWebAuthn(rpid)
	if err != nil {
		return nil, err
	}

	creation, session, err := wa.BeginRegistration(pu, opts...)
	if err != nil {
		return nil, fmt.Errorf(
			"[PasskeyService] Begin Registration: %w", err,
		)
	}

	s.sessions.Store(email+"_reg", session)

	raw, err := json.Marshal(creation)
	if err != nil {
		return nil, fmt.Errorf(
			"[PasskeyService] Marshal Challenge: %w", err,
		)
	}
	return raw, nil
}

// FinishRegistration verifies the attestation and persists the credential.
func (s *passkeyService) FinishRegistration(
	ctx context.Context, email string, r *http.Request,
) error {
	pu, err := s.buildPasskeyUser(ctx, email)
	if err != nil {
		return err
	}

	val, ok := s.sessions.LoadAndDelete(email + "_reg")
	if !ok {
		return fmt.Errorf(
			"[PasskeyService] Finish Registration: no session found",
		)
	}
	session := val.(*webauthn.SessionData)

	rpid := rpidFromRequest(r)
	wa, err := s.getWebAuthn(rpid)
	if err != nil {
		return err
	}

	cred, err := wa.FinishRegistration(pu, *session, r)
	if err != nil {
		return fmt.Errorf(
			"[PasskeyService] Finish Registration: %w", err,
		)
	}

	transport := ""
	if len(cred.Transport) > 0 {
		transports := make([]string, len(cred.Transport))
		for i, t := range cred.Transport {
			transports[i] = string(t)
		}
		transport = strings.Join(transports, ",")
	}

	id := uuid.New()
	pk := &models.Passkey{
		ID:             id[:],
		UserID:         pu.id,
		Name:           "Passkey",
		CredentialID:   cred.ID,
		PublicKey:      cred.PublicKey,
		AAGUID:         fmt.Sprintf("%x", cred.Authenticator.AAGUID),
		Transport:      transport,
		SignCount:      cred.Authenticator.SignCount,
		BackupEligible: cred.Flags.BackupEligible,
		BackupState:    cred.Flags.BackupState,
	}

	if err = s.passkeyRepo.InsertPasskey(ctx, pk); err != nil {
		return fmt.Errorf(
			"[PasskeyService] Save Passkey: %w", err,
		)
	}
	return nil
}

// BeginVerification generates a WebAuthn authentication challenge.
func (s *passkeyService) BeginVerification(
	ctx context.Context, email string, platformAvailable bool,
	r *http.Request,
) ([]byte, error) {
	pu, err := s.buildPasskeyUser(ctx, email)
	if err != nil {
		return nil, err
	}

	rpid := rpidFromRequest(r)
	wa, err := s.getWebAuthn(rpid)
	if err != nil {
		return nil, err
	}

	assertion, session, err := wa.BeginLogin(pu)
	if err != nil {
		return nil, fmt.Errorf(
			"[PasskeyService] Begin Verification: %w", err,
		)
	}

	s.sessions.Store(email+"_auth", session)

	raw, err := json.Marshal(assertion)
	if err != nil {
		return nil, fmt.Errorf(
			"[PasskeyService] Marshal Challenge: %w", err,
		)
	}
	return raw, nil
}

// FinishVerification validates the assertion and updates the sign count.
func (s *passkeyService) FinishVerification(
	ctx context.Context, email string, r *http.Request,
) error {
	pu, err := s.buildPasskeyUser(ctx, email)
	if err != nil {
		return err
	}

	val, ok := s.sessions.LoadAndDelete(email + "_auth")
	if !ok {
		return fmt.Errorf(
			"[PasskeyService] Finish Verification: no session found",
		)
	}
	session := val.(*webauthn.SessionData)

	rpid := rpidFromRequest(r)
	wa, err := s.getWebAuthn(rpid)
	if err != nil {
		return err
	}

	cred, err := wa.FinishLogin(pu, *session, r)
	if err != nil {
		return fmt.Errorf(
			"[PasskeyService] Finish Verification: %w", err,
		)
	}

	err = s.passkeyRepo.UpdatePasskeySignCount(
		ctx,
		cred.ID,
		cred.Authenticator.SignCount,
	)
	if err != nil {
		return fmt.Errorf(
			"[PasskeyService] Update Sign Count: %w", err,
		)
	}
	return nil
}

// HasPasskey reports whether the user identified by email has at
// least one registered passkey credential.
func (s *passkeyService) HasPasskey(
	ctx context.Context, email string,
) (bool, error) {
	user, err := s.userService.GetUserByEmail(ctx, email)
	if err != nil {
		return false, fmt.Errorf(
			"[PasskeyService] HasPasskey User Lookup: %w", err,
		)
	}

	uid, err := uuid.Parse(user.ID)
	if err != nil {
		return false, fmt.Errorf(
			"[PasskeyService] HasPasskey UUID Parse: %w", err,
		)
	}

	return s.passkeyRepo.HasPasskey(ctx, uid[:])
}

// getWebAuthn returns a customized WebAuthn instance for the given RPID.
func (s *passkeyService) getWebAuthn(
	rpid string,
) (*webauthn.WebAuthn, error) {
	if rpid == "" {
		return s.wa, nil
	}
	requireRK := true
	return webauthn.New(&webauthn.Config{
		RPDisplayName: "Identity Provider",
		RPID:          rpid,
		RPOrigins:     s.wa.Config.RPOrigins,
		AuthenticatorSelection: protocol.AuthenticatorSelection{
			RequireResidentKey: &requireRK,
			ResidentKey:        protocol.ResidentKeyRequirementRequired,
			UserVerification:   protocol.VerificationPreferred,
		},
	})
}

// rpidFromRequest extracts the hostname from request origin/referer/headers.
func rpidFromRequest(r *http.Request) string {
	if r == nil {
		return ""
	}
	if origin := r.Header.Get("Origin"); origin != "" {
		parsed, err := url.Parse(origin)
		if err == nil && parsed.Hostname() != "" {
			return parsed.Hostname()
		}
	}
	if referer := r.Header.Get("Referer"); referer != "" {
		parsed, err := url.Parse(referer)
		if err == nil && parsed.Hostname() != "" {
			return parsed.Hostname()
		}
	}
	if host := r.Header.Get("X-Forwarded-Host"); host != "" {
		return host
	}
	if host := r.Host; host != "" {
		if idx := strings.Index(host, ":"); idx != -1 {
			return host[:idx]
		}
		return host
	}
	return ""
}
