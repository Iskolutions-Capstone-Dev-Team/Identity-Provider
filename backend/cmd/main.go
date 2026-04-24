package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"encoding/json"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/docs"
	_ "github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/docs"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/api"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/database"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/initializers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/swaggo/swag"
	"strings"
)

// @title Unified Access Identity Provider API
// @version 1.0
// @description Identity Provider for the Unified School System Capstone.
// @termsOfService http://swagger.io/terms/
// @contact.name Miko Lorenz Causon
// @contact.email causonmikolorenz@gmail.com
// @license.name MIT
// @license.url https://opensource.org/licenses/MIT
// @host identity-provider.isaxbsit2027.com
// @BasePath /api/v1
// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type 'Bearer ' followed by your token.
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name X-API-Key
// @description Your custom API Key for identification.
func initSwagger() {
	originalDoc := docs.SwaggerInfo.ReadDoc()

	// Register Internal Doc (unfiltered)
	swag.Register("internal", &swag.Spec{
		InfoInstanceName: "internal",
		SwaggerTemplate:  originalDoc,
	})

	// Parse Doc for filtering
	var docMap map[string]interface{}
	if err := json.Unmarshal([]byte(originalDoc), &docMap); err != nil {
		log.Printf("[initSwagger] Error parsing original doc: %v", err)
		return
	}

	// Filter paths for External Doc
	paths, ok := docMap["paths"].(map[string]interface{})
	if !ok {
		log.Printf("[initSwagger] Error extracting paths")
		return
	}

	externalPaths := make(map[string]interface{})
	for path, methods := range paths {
		isExternal := false
		if strings.Contains(path, "jwks.json") || path == "/me" {
			isExternal = true
		} else if strings.Contains(path, "auth/") {
			if !strings.Contains(path, "/login") &&
				!strings.Contains(path, "/session") {
				isExternal = true
			}
		}

		if isExternal {
			externalPaths[path] = methods
		}
	}
	docMap["paths"] = externalPaths
	docBytes, err := json.Marshal(docMap)
	if err != nil {
		log.Printf("[initSwagger] Error marshaling external doc: %v", err)
		return
	}

	// Register External Doc (filtered)
	swag.Register("external", &swag.Spec{
		InfoInstanceName: "external",
		SwaggerTemplate:  string(docBytes),
	})
}

func main() {
	godotenv.Load()
	initSwagger()
	initializers.LoadRSAKeys()
	if err := initializers.NewS3Storage(); err != nil {
		log.Printf("[Main] S3 Storage Warning: %v", err)
	}

	doMigrate := flag.Bool("migrate", false, "Run database migration first")
	flag.Parse()

	if *doMigrate {
		initializers.MigrateAndSeed()
	}

	appDB, err := database.ConnectToDB()
	if err != nil {
		log.Fatalf("[Main] App Database Connection Failed: %v", err)
	}
	defer appDB.Close()

	s := initializers.InitializeServices(appDB)
	h := initializers.InitializeHandlers(appDB, &s)

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer stop()

	database.StartJanitor(ctx, appDB, 10*time.Minute)

	r := gin.Default()
	r.Use(h.CORS)

	// Register separate Swagger UI routes for Internal and External views
	r.GET("/swagger/internal/*any", ginSwagger.WrapHandler(
		swaggerFiles.Handler, ginSwagger.InstanceName("internal"),
	))
	r.GET("/swagger/external/*any", ginSwagger.WrapHandler(
		swaggerFiles.Handler, ginSwagger.InstanceName("external"),
	))

	api.SetupRoutes(r, *h)

	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[Main] Server Listen Error: %v", err)
		}
	}()

	fmt.Println("Backend is operational on :8080")

	<-ctx.Done()

	stop()
	log.Println("Shutting down gracefully...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("[Main] Forced Shutdown Error: %v", err)
	}

	log.Println("Server exited")
}
