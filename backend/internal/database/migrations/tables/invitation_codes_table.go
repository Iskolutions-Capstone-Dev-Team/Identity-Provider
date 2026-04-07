package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var InvitationCodesMigration = migrations.TableMigration{
	TableName: "invitation_codes",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-invitation-codes-table-v1",
			SQL: `CREATE TABLE IF NOT EXISTS invitation_codes (
				id INT AUTO_INCREMENT PRIMARY KEY,
				email VARCHAR(100) NOT NULL UNIQUE,
				invitation_type ENUM('student', 'admin', 'guest', 'applicant') NOT NULL,
				invitation_code VARCHAR(255) NOT NULL UNIQUE,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);`,
		},
	},
}
