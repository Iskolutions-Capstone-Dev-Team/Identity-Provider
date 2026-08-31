package tables

import (
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"
)

// UserDevicesMigration defines the schema for trusting user devices.
var UserDevicesMigration = migrations.TableMigration{
	TableName: "user_devices",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-user-devices-table",
			SQL: `CREATE TABLE IF NOT EXISTS user_devices (
				id BINARY(16) PRIMARY KEY,
				user_id BINARY(16) NOT NULL,
				device_token_hash VARCHAR(255) NOT NULL UNIQUE,
				device_name VARCHAR(255) NOT NULL,
				ip_address VARCHAR(45) NOT NULL,
				user_agent VARCHAR(512) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				expires_at TIMESTAMP NOT NULL,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				INDEX idx_user_device_hash (device_token_hash)
			);`,
		},
	},
}
