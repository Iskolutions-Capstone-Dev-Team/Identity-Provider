package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var PreapprovedClientsMigration = migrations.TableMigration{
	TableName: "preapproved_clients",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-preapproved-clients-table",
			SQL: `
			CREATE TABLE IF NOT EXISTS preapproved_clients (
				account_type_id INT NOT NULL,
				client_id BINARY(16) NOT NULL,
				PRIMARY KEY (account_type_id, client_id),
				FOREIGN KEY (account_type_id) REFERENCES account_types(id),
				FOREIGN KEY (client_id) REFERENCES clients(id)
			);`,
		},
		{
			ID: "backfill-null-user-account-types",
			SQL: `
			UPDATE users u
			JOIN client_allowed_users cau 
				ON u.id = cau.user_id
			JOIN preapproved_clients pc 
				ON cau.client_id = pc.client_id
			LEFT JOIN clients c 
				ON pc.client_id = c.id
			LEFT JOIN account_types sa 
				ON sa.name = 'System Administrator'
			SET u.account_type_id = CASE 
				WHEN c.description = 'Identity Provider' THEN sa.id
				ELSE pc.account_type_id 
			END
			WHERE u.account_type_id IS NULL;`,
		},
	},
}
