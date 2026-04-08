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
	},
}
