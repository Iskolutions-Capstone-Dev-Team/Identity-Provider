package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var AdminAllowedClientsMigration = migrations.TableMigration{
	TableName: "admin_allowed_clients",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-admin-allowed-clients-table",
			SQL: `CREATE TABLE IF NOT EXISTS admin_allowed_clients (
				client_id BINARY(16),
				user_id INT,
				assigned_at TIMESTAMP DEFAULT NOW(),
				PRIMARY KEY (client_id, user_id),
				FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				INDEX idx_role_lookup (role_id)
			);`,
		},
	},
}
