package models

type Permission struct {
	ID             int    `db:"id"`
	PermissionName string `db:"permission"`
}
