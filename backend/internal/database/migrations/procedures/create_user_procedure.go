package procedures

import "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database/migrations"

var CreateUserProcedure = migrations.MigrationPart{
	Name: "create-user-procedure",
	SQL: `
        DROP PROCEDURE IF EXISTS CreateUser;
        
        -- We define the procedure's default collation here
        CREATE PROCEDURE CreateUser(
            IN p_userId BINARY(16),
            IN p_firstName VARCHAR(50),
            IN p_middleName VARCHAR(50),
            IN p_lastName VARCHAR(50),
            IN p_nameSuffix VARCHAR(5),
            IN p_userEmail VARCHAR(100),
            IN p_userPasswordHash VARCHAR(255),
            IN p_rolesJson JSON
        )
        BEGIN
            DECLARE EXIT HANDLER FOR SQLEXCEPTION
            BEGIN
                ROLLBACK;
                RESIGNAL;
            END;

            START TRANSACTION;

            -- 1. Use COLLATE explicitly in the check to resolve the 'Illegal Mix'
            IF NOT EXISTS (
                SELECT 1 FROM users 
                WHERE email COLLATE utf8mb4_unicode_ci = p_userEmail COLLATE utf8mb4_unicode_ci
            ) THEN
                INSERT INTO users (
                    id, first_name, middle_name, last_name, name_suffix, email, password_hash
                )
                VALUES (
                    p_userId, 
                    COALESCE(p_firstName, ''), 
                    COALESCE(p_middleName, ''), 
                    COALESCE(p_lastName, ''), 
                    COALESCE(p_nameSuffix, ''),
                    p_userEmail, 
                    p_userPasswordHash
                );
            
                -- 2. Insert roles with explicit collation casting
                INSERT INTO user_roles (user_id, role_id)
                SELECT p_userId, r.id
                FROM roles r
                WHERE r.role_name COLLATE utf8mb4_unicode_ci IN (
                    SELECT jt.role_name COLLATE utf8mb4_unicode_ci
                    FROM JSON_TABLE(
                        p_rolesJson, 
                        "$[*]" COLUMNS(role_name VARCHAR(50) PATH "$")
                    ) AS jt
                );

                COMMIT;
            ELSE
                ROLLBACK;
            END IF;
        END;
    `,
}
