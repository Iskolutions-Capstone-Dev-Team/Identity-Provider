package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var PermissionsMigration = migrations.TableMigration{
	TableName: "permissions",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-permissions-table",
			SQL: `CREATE TABLE IF NOT EXISTS permissions (
				id INT AUTO_INCREMENT PRIMARY KEY,
				permission VARCHAR(100) NOT NULL UNIQUE
			);`,
		},
	},
}