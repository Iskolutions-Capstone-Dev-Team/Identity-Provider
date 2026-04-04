package procedures

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var GetUserForAuthProcedure = migrations.MigrationPart{
	Name: "get-user-for-auth-procedure",
	SQL: `
        DROP PROCEDURE IF EXISTS GetUserForAuth;
        CREATE PROCEDURE GetUserForAuth(IN p_email VARCHAR(255))
        BEGIN
            SELECT 
                u.id,
				u.email, 
				u.first_name,
				u.middle_name,
				u.last_name,
                u.password_hash, 
                u.status,
                IFNULL(r.role_name, '') as roles
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = p_email AND u.status != 'deleted'
            LIMIT 1;
        END;`,
}
