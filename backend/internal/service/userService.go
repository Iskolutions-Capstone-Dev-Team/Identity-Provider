package service

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/dto"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
)

func GetUserRoles(roles []models.Role) ([]dto.UserRoleRepsonse, error) {
	var roleList []dto.UserRoleRepsonse
	for _, role := range roles {
		roleList = append(roleList, dto.UserRoleRepsonse{
			ID:       role.ID,
			RoleName: role.RoleName,
		})
	}
	return roleList, nil
}
