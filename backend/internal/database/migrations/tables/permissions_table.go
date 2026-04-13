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
		{
			ID: "add-more-default-permissions",
			SQL: `INSERT IGNORE INTO permissions (permission) VALUES 
				('Add Roles'),
				('Assign appclient to user'),
				('Remove appclient from user'),
				('Remove Roles'),
				('Suspend user'),
				('Activate user'),
				('View audit logs'),
				('View security logs')
			;`,
		},
		{
			ID: "add-registration-permissions",
			SQL: `INSERT IGNORE INTO permissions (permission) VALUES 
				('View Registration Config'),
				('Edit Registration Config')
			;`,
		},
		{
			ID: "remove-obsolete-registration-permissions",
			SQL: `DELETE FROM permissions WHERE permission IN (
				'Approve registration request',
				'Reject registration request',
				'View registration requests'
			);`,
		},
		{
			ID: "add-extra-registration-permissions",
			SQL: `INSERT IGNORE INTO permissions (permission) VALUES 
				('Create Registration Config'),
				('Delete Registration Config')
			;`,
		},
	},
}