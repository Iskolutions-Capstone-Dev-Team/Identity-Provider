package tables

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"
)

// PasswordHistoriesMigration defines the schema and initial data for tracking
// historical passwords.
var PasswordHistoriesMigration = migrations.TableMigration{
	TableName: "password_histories",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-password-histories-table",
			SQL: `CREATE TABLE IF NOT EXISTS password_histories (
				id BIGINT AUTO_INCREMENT PRIMARY KEY,
				user_id BINARY(16) NOT NULL,
				password_hash VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				INDEX idx_user_password_history (user_id, created_at DESC)
			);`,
		},
		{
			ID: "bootstrap-password-histories-from-users",
			SQL: `INSERT INTO password_histories (
				user_id,
				password_hash,
				created_at
			)
			SELECT id, password_hash, NOW()
			FROM users
			WHERE password_hash IS NOT NULL AND status != 'deleted';`,
		},
	},
}
