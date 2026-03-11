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
				action VARCHAR(100) NOT NULL,
				target VARCHAR(100) NOT NULL,
				metadata JSON,
				status ENUM('success', 'fail') NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);`,
		},
	},
}
