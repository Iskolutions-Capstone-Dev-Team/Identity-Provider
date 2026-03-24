package tables

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var OTPMigration = migrations.TableMigration{
	TableName: "otp",
	Steps: []migrations.MigrationStep{
		{
			ID: "create-otp-table",
			SQL: `
			CREATE TABLE user_otps (
				id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
				email VARCHAR(255) NOT NULL,
				code_hash CHAR(64) NOT NULL,
				retries TINYINT UNSIGNED DEFAULT 0 NOT NULL,
				status ENUM('pending', 'verified', 'expired', 'blocked') DEFAULT 'pending',
				ip_address VARCHAR(45),
				user_agent TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				expires_at TIMESTAMP NOT NULL,
				revoked_at TIMESTAMP NULL DEFAULT NULL,
				INDEX idx_otp_email_lookup (email, status, expires_at)
			);`,
		},
	},
}
