package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var SecurityLogsMigration = migrations.TableMigration{
	TableName: "security_logs",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-security-logs-table",
			SQL: `
			 CREATE TABLE IF NOT EXISTS security_logs (
				id BIGINT AUTO_INCREMENT PRIMARY KEY,
				actor VARCHAR(100),
				action VARCHAR(100) NOT NULL,
				target VARCHAR(100) NOT NULL,
				metadata JSON,
				status ENUM('success', 'fail') NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);`,
		},
		{
			ID: "add-security-logs-created-at-index",
			SQL: `CREATE INDEX idx_security_logs_created_at ON security_logs (created_at);`,
		},
		{
			ID: "add-security-logs-status-created-at-index",
			SQL: `CREATE INDEX idx_security_logs_status_created_at ON security_logs (status, created_at);`,
		},
	},
}
