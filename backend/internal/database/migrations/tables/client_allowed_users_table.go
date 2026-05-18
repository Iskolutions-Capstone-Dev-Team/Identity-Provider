package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var ClientAllowedUsersMigration = migrations.TableMigration{
	TableName: "client_allowed_users",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-client-allowed-users-table",
			SQL: `CREATE TABLE IF NOT EXISTS client_allowed_users (
				client_id BINARY(16),
				user_id BINARY(16),
				assigned_at TIMESTAMP DEFAULT NOW(),
				PRIMARY KEY (client_id, user_id),
				FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				INDEX idx_client_lookup (client_id),
				INDEX idx_user_lookup (user_id)
			);`,
		},
	},
}
