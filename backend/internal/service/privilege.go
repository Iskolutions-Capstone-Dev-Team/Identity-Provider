package service

import (
	"crypto/rsa"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	Superadmin      = "IDP:superadmin"
	Admin           = "IDP:admin"
	LevelSuperAdmin = 1
	LevelAdmin      = 2
	ErrorLevel      = 0
)

type PrivilegeService struct {
	PubKey   *rsa.PublicKey
	UserRepo *repository.UserRepository
}

func (s *PrivilegeService) CheckUserPrivelege(c *gin.Context) (int, error) {
	accessToken, err := c.Cookie("access_cookie")

	token, err := GetParsedToken(accessToken, s.PubKey)
	claims := token.Claims.(*models.UserClaims)

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return ErrorLevel, err
	}

	userRoles, err := s.UserRepo.GetRoles(userID[:])
	if err != nil {
		return ErrorLevel, err
	}

	roleNames := GetRoleNames(userRoles)
	for _, role := range roleNames {
		if role == Superadmin {
			return LevelSuperAdmin, nil
		}
		if role == Admin {
			return LevelAdmin, nil
		}
	}

	return ErrorLevel, nil
}
