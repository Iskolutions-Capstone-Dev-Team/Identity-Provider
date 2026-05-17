package tables

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"
)

/**
 * UserAuthenticatorsMigration defines the schema for MFA authenticators,
 * including TOTP secrets and future WebAuthn support.
 */
var UserAuthenticatorsMigration = migrations.TableMigration{
	TableName: "user_authenticators",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-user-authenticators-table",
			SQL: `CREATE TABLE IF NOT EXISTS user_authenticators (
				id BINARY(16) PRIMARY KEY,
				user_id BINARY(16) NOT NULL,
				type VARCHAR(50) NOT NULL,
				name VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT NOW(),
				last_used_at TIMESTAMP NULL,
				secret_encrypted VARBINARY(255),
				credential_id VARBINARY(255),
				public_key VARBINARY(512),
				sign_count INT DEFAULT 0,
				CONSTRAINT fk_authenticator_user 
					FOREIGN KEY (user_id) REFERENCES users(id) 
					ON DELETE CASCADE
			);`,
		},
	},
}
