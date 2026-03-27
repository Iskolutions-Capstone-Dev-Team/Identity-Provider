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
		{
			ID: "add-default-permissions",
			SQL: `INSERT IGNORE INTO permissions (permission) VALUES 
				('Add user'),
				('Edit user'),
				('Delete user'),
				('View all users'),
				('View users based on appclient'),
				('Approve registration request'),
				('Reject registration request'),
				('View registration requests'),
				('Add appclient'),
				('Edit appclient'),
				('Delete appclient'),
				('View all appclients'),
				('View roles'),
				('Assign Roles'),
				('Edit Roles'),
				('Delete Roles')
			;`,
		},
	},
}