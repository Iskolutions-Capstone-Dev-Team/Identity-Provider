package service

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
)

func GetRoleNames(roles []models.Role) []string {
	return utils.Map(roles, func(role models.Role) string {
		return role.RoleName
	})
}
