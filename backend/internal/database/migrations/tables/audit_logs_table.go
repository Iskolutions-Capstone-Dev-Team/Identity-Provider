package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var AuditLogsMigration = migrations.TableMigration{
	TableName: "audit_logs",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-audit-logs-table",
			SQL: `
			CREATE TABLE IF NOT EXISTS audit_logs (
				id BIGINT AUTO_INCREMENT PRIMARY KEY,
				actor VARCHAR(100),
			);`,
		},
		{
            ID: "add-action-target-to-audit-logs",
            SQL: `
            ALTER TABLE audit_logs 
            ADD COLUMN IF NOT EXISTS action VARCHAR(100) NOT NULL,
            ADD COLUMN IF NOT EXISTS target VARCHAR(100) NOT NULL;
            `,
        },
        {
            ID: "add-metadata-to-audit-logs",
            SQL: `
            ALTER TABLE audit_logs 
            ADD COLUMN IF NOT EXISTS metadata JSON;
            `,
        },
        {
            ID: "add-status-enum-to-audit-logs",
            SQL: `
            ALTER TABLE audit_logs 
            ADD COLUMN IF NOT EXISTS status ENUM('success', 'fail') NOT NULL;
            `,
        },
        {
            ID: "add-timestamp-to-audit-logs",
            SQL: `
            ALTER TABLE audit_logs 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP 
            DEFAULT CURRENT_TIMESTAMP;
            `,
        },
	},
}
