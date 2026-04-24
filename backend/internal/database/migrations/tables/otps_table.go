package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var OtpsMigration = migrations.TableMigration{
	TableName: "otps",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-otps-table-v1",
			SQL: `CREATE TABLE IF NOT EXISTS otps (
				otp VARCHAR(6) PRIMARY KEY,
				user_id BINARY(16) NOT NULL,
				expires_at TIMESTAMP NOT NULL,
				used_at TIMESTAMP NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
			);`,
		},
		{
			ID:  "add-attempts-column",
			SQL: `ALTER TABLE otps ADD COLUMN attempts INT DEFAULT 0;`,
		},
		{
			ID: "drop-user-id-and-add-email",
			SQL: `ALTER TABLE otps 
                  DROP FOREIGN KEY otps_ibfk_1, 
                  DROP COLUMN user_id, 
                  ADD COLUMN email VARCHAR(255) NOT NULL;`,
		},
	},
}
