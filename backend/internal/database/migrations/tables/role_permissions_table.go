package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var RolePermissionMigration = migrations.TableMigration{
	TableName: "role_permissions",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-role-permissions-table",
			SQL: `CREATE TABLE IF NOT EXISTS role_permissions (
				role_id INT,
				permission_id INT,
				PRIMARY KEY (role_id, permission_id),
				FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
				FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
			);`,
		},
	},
}
