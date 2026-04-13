package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

// AccountTypesMigration defines the database schema and seeds for account types.
var AccountTypesMigration = migrations.TableMigration{
	TableName: "account_types",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-account-types-table",
			SQL: `
			CREATE TABLE IF NOT EXISTS account_types (
				id INT AUTO_INCREMENT PRIMARY KEY,
				name VARCHAR(50) NOT NULL UNIQUE
			);`,
		},
		{
			ID: "seed-account-types",
			SQL: `
			INSERT INTO account_types (name) VALUES 
			('admin'), ('faculty'), ('student'), ('applicant'), ('guest')
			ON DUPLICATE KEY UPDATE name=VALUES(name);`,
		},
		{
			ID: "update-admin-to-system-administrator",
			SQL: `
			UPDATE account_types 
			SET name = 'System Administrator' 
			WHERE name = 'admin';`,
		},
	},
}
