package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var ClientAllowedRolesMigration = migrations.TableMigration{
	TableName: "client_allowed_roles",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-client-allowed-roles-table",
			SQL: `CREATE TABLE IF NOT EXISTS client_allowed_roles (
				client_id BINARY(16),
				role_id INT,
				assigned_at TIMESTAMP DEFAULT NOW(),
				PRIMARY KEY (client_id, role_id),
				FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
				FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
				INDEX idx_role_lookup (role_id)
			);`,
		},
		{
			ID: "drop-client-allowed-roles-table",
			SQL: `DROP TABLE IF EXISTS client_allowed_roles;`,
		},
	},
}
