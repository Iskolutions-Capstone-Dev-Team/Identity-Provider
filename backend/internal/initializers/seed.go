package initializers

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

/**
 * Migrate handles the database schema updates and initial data seeding.
 */
func MigrateAndSeed() {
	adminDatabase, err := database.ConnectAdminToDB()
	if err != nil {
		log.Fatalf("[Migrate] Admin Connection Failed: %v", err)
	}
	defer adminDatabase.Close()

	database.RunAllMigrations(adminDatabase)
	fmt.Println("Database migration completed successfully.")

	roleID, err := seedSuperAdminRole(adminDatabase)
	if err != nil {
		log.Print(err)
	}

	err = seedAdminUser(adminDatabase, roleID)
	if err != nil {
		log.Print(err)
	}

	err = seedAppClient(adminDatabase)
	if err != nil {
		log.Print(err)
	}

	privilegedTables := [...]string{
		"authorization_codes",
		"refresh_tokens",
		"idp_sessions",
		"client_grant_types",
		"roles",
		"admin_allowed_clients",
		"role_permissions",
		"client_allowed_users",
	}

	for _, tableName := range privilegedTables {
		err = grantDeleteOnTable(tableName, adminDatabase)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func seedSuperAdminRole(db *sqlx.DB) (int, error) {
	ctx := context.Background()
	roleRepo := repository.NewRoleRepository(db)
	permissionRepo := repository.NewPermissionRepository(db)

	roleName := "IDP:superadmin"
	var existingID int
	query := "SELECT id FROM roles WHERE role_name = ? AND deleted_at IS NULL"
	err := db.Get(&existingID, query, roleName)
	if err == nil {
		return existingID, nil
	}

	allPerms, err := permissionRepo.GetAllPermissions(ctx)
	if err != nil {
		return 0, fmt.Errorf("[Seed] Failed to fetch permissions: %v", err)
	}

	var selectedPerms []models.Permission
	for _, p := range allPerms {
		if p.PermissionName != "View users based on appclient" {
			selectedPerms = append(selectedPerms, p)
		}
	}

	role := models.Role{
		RoleName:    roleName,
		Description: "Super Administrator with full system access.",
		Permissions: selectedPerms,
	}

	result, err := roleRepo.CreateRole(ctx, role)
	if err != nil {
		return 0, fmt.Errorf("[Seed] Failed to create superadmin role: %v", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, nil
	}

	return int(id), nil
}

func seedAdminUser(adminDatabase *sqlx.DB, superAdminRoleID int) error {
	ctx := context.Background()
	userRepo := repository.NewUserRepository(adminDatabase)
	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPass := os.Getenv("ADMIN_PASSWORD")

	admin, err := userRepo.GetUserByEmail(ctx, adminEmail)
	if err != nil {
		return fmt.Errorf("[Migrate] Error checking for existing admin: %v", err)
	}

	if admin == nil {
		newAdminID := uuid.New()
		hashedPassword, _ := utils.HashSecret(adminPass)

		admin = &models.User{
			ID:           newAdminID[:],
			Email:        adminEmail,
			PasswordHash: hashedPassword,
			Status:       models.StatusActive,
			RoleID: sql.NullInt64{
				Int64: int64(superAdminRoleID),
				Valid: true,
			},
		}

		if err := userRepo.CreateUser(ctx, admin); err != nil {
			return fmt.Errorf("[Migrate] Admin seeding failed: %v", err)
		}
	}

	if admin != nil && superAdminRoleID != 0 {
		err := userRepo.UpdateUserRole(ctx, admin.ID, sql.NullInt64{
			Int64: int64(superAdminRoleID),
			Valid: true,
		})
		if err != nil {
			return fmt.Errorf("[Migrate] Failed to assign superadmin role: %v", err)
		}
	}

	fmt.Printf("Admin user %s seeded successfully.\n", adminEmail)
	return nil
}

func seedAppClient(adminDatabase *sqlx.DB) error {
	ctx := context.Background()
	cID := os.Getenv("CLIENT_ID")
	cSecret := os.Getenv("CLIENT_SECRET")
	cName := os.Getenv("CLIENT_NAME")
	cCallback := os.Getenv("CLIENT_CALLBACK_URL")
	cBase := os.Getenv("CLIENT_BASE_URL")

	parsedID, _ := uuid.Parse(cID)
	clientRepo := repository.NewClientRepository(adminDatabase)

	existingClient, _ := clientRepo.GetByID(ctx, parsedID[:])
	if existingClient != nil {
		fmt.Printf("Client %s already seeded.\n", cName)
		return nil
	}

	hashedClientSecret, _ := utils.HashSecret(cSecret)
	grants := []string{
		"authorization_code",
		"refresh_token",
		"client_credentials",
	}

	client := &models.Client{
		ID:            parsedID[:],
		ClientName:    cName,
		ClientSecret:  hashedClientSecret,
		BaseUrl:       cBase,
		RedirectUri:   cCallback,
		LogoutUri:     cBase,
		Description:   "Identity Provider",
		ImageLocation: "",
	}

	adminEmail := os.Getenv("ADMIN_EMAIL")
	userRepo := repository.NewUserRepository(adminDatabase)
	admin, err := userRepo.GetUserByEmail(ctx, adminEmail)
	if err != nil || admin == nil {
		return fmt.Errorf("[Migrate] Failed to fetch admin for client bind")
	}

	err = clientRepo.CreateClient(ctx, client, grants, admin.ID)
	if err != nil {
		return fmt.Errorf("[Migrate] Client seeding failed: %v", err)
	}

	fmt.Printf("Client %s registered successfully.\n", cName)
	return nil
}

func grantDeleteOnTable(tableName string, db *sqlx.DB) error {
	databaseName := os.Getenv("MYSQL_DB_NAME")
	appUser := os.Getenv("APP_USER")

	query := fmt.Sprintf(
		"GRANT DELETE ON `%s`.`%s` TO '%s'@'%%'; FLUSH PRIVILEGES;",
		databaseName,
		tableName,
		appUser,
	)

	_, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("[GrantDeleteOnTable] {Query}: %v", err)
	}
	return nil
}
