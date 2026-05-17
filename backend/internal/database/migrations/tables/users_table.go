package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var UsersMigration = migrations.TableMigration{
	TableName: "users",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-users-table",
			SQL: `CREATE TABLE IF NOT EXISTS users (
				id BINARY(16) PRIMARY KEY,
				username VARCHAR(255) NOT NULL UNIQUE,
				first_name VARCHAR(50),
				middle_name VARCHAR(50),
				last_name VARCHAR(50),
				email VARCHAR(100) NOT NULL UNIQUE,
				password_hash VARCHAR(255) NOT NULL,
				status ENUM(
					'active', 
					'inactive', 
					'suspended', 
					'deleted'
				) DEFAULT 'active',
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
				deleted_at TIMESTAMP NULL
			);`,
		},
		{
			ID: "remove-username-column",
			SQL: `
				ALTER TABLE users
				DROP COLUMN username;
			`,
		},
		{
			ID: "add-name-suffix-column",
			SQL: `
				ALTER TABLE users
				ADD COLUMN name_suffix VARCHAR(20);
			`,
		},
		{
			ID: "add-role-id-column",
			SQL: `
				ALTER TABLE users
				ADD COLUMN role_id INT,
				ADD CONSTRAINT fk_user_role 
					FOREIGN KEY (role_id) REFERENCES roles(id);
			`,
		},
		{
			ID: "add-account-type-id-column",
			SQL: `
				ALTER TABLE users
				ADD COLUMN account_type_id INT,
				ADD CONSTRAINT fk_user_account_type 
					FOREIGN KEY (account_type_id) REFERENCES account_types(id);
			`,
		},
	},
}
