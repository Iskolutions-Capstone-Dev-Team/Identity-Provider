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
		{
			ID: "refactor-to-account-type-id",
			SQL: `
			ALTER TABLE invitation_codes 
			ADD COLUMN account_type_id INT;

			UPDATE invitation_codes ic
			JOIN account_types at ON (
				CASE 
					WHEN ic.invitation_type = 'admin' THEN 'System Administrator'
					ELSE ic.invitation_type 
				END
			) = at.name
			SET ic.account_type_id = at.id;

			ALTER TABLE invitation_codes 
			DROP COLUMN invitation_type,
			MODIFY COLUMN account_type_id INT NOT NULL,
			ADD CONSTRAINT fk_invitation_account_type 
				FOREIGN KEY (account_type_id) REFERENCES account_types(id);
			`,
		},
	},
}
