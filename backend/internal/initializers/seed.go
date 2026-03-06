package initializers

import (
	"fmt"
	"log"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/auth"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/models"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/repository"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

/**
 * Migrate handles the database schema updates and initial data seeding.
 * It uses administrative privileges to ensure schema changes are permitted.
 */
func MigrateAndSeed() {
	adminDatabase, err := database.ConnectAdminToDB()
	if err != nil {
		log.Fatalf("[Migrate] Admin Connection Failed: %v", err)
	}
	defer adminDatabase.Close()

	database.RunAllMigrations(adminDatabase)
	fmt.Println("Database migration completed successfully.")

	err = seedAdminUser(adminDatabase); if err != nil {
		log.Print(err)
	}

	err = seedAppClient(adminDatabase); if err != nil {
		log.Print(err)
	}

	privelegedTables := [...]string{
		"authorization_codes", 
		"refresh_tokens",
		"user_roles",
		"idp_sessions",
		"client_grant_types",
		"client_allowed_roles",
	}

	for _, tableName := range privelegedTables {
		err = grantDeleteOnTable(tableName, adminDatabase); if err != nil {
			log.Fatal(err)
		}
	}
}

func seedAdminUser(adminDatabase *sqlx.DB) error {
	userRepo := repository.NewUserRepository(adminDatabase)

	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPass := os.Getenv("ADMIN_PASSWORD")
	adminUser := os.Getenv("ADMIN_USERNAME")

	adminDatabase.Exec("DELETE FROM users WHERE email = ?", adminEmail)

	newAdminID := uuid.New()
	hashedPassword, _ := auth.HashSecret(adminPass)

	user := &models.User{
		ID:           newAdminID[:],
		Username:     adminUser,
		Email:        adminEmail,
		PasswordHash: hashedPassword,
		RoleString:   []string{"idp:superadmin"},
	}

	if err := userRepo.CreateUser(user); err != nil {
		return fmt.Errorf("[Migrate] Admin seeding failed: %v", err)
	} else {
		fmt.Printf("Admin user %s seeded successfully.\n", adminEmail)
	}
	return nil
}

func seedAppClient(adminDatabase *sqlx.DB) error {
	// Fetch client magic values from environment
	cID := os.Getenv("CLIENT_ID")
	cSecret := os.Getenv("CLIENT_SECRET")
	cName := os.Getenv("CLIENT_NAME")
	cCallback := os.Getenv("CLIENT_CALLBACK_URL")
	cBase := os.Getenv("CLIENT_BASE_URL")
	ctag := os.Getenv("CLIENT_TAG")

	parsedID, _ := uuid.Parse(cID)
	hashedClientSecret, _ := auth.HashSecret(cSecret)
	grants := []string{
		"authorization_code", 
		"refresh_token", 
		"client_credentials",
	}
	roleIDs := []int{1, 2}

	// Initialize the struct to avoid nil pointer
	client := &models.Client{
		ID:            parsedID[:],
		ClientName:    cName,
		Tag:           ctag,
		ClientSecret:  hashedClientSecret,
		BaseUrl:       cBase,
		RedirectUri:   cCallback,
		LogoutUri:     cBase,
		Description:   "",
		ImageLocation: "",
	}

	clientRepo := repository.NewClientRepository(adminDatabase)
	err := clientRepo.CreateClient(client, grants, roleIDs)
	if err != nil {
		return fmt.Errorf("[Migrate] Client seeding failed: %v", err)
	} else {
		fmt.Printf("Client %s registered successfully.\n", cName)
	}
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