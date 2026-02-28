package initializers

import (
	"fmt"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var Storage *storage.S3Provider

func NewS3Storage() error {
	endpoint := os.Getenv("S3_ENDPOINT")
	accessKey := os.Getenv("S3_KEY")
	secretKey := os.Getenv("S3_SECRET")
	useSSL := os.Getenv("S3_USE_SSL") == "true"
	bucket := os.Getenv("S3_BUCKET")

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return fmt.Errorf("[StorageInit] Client Creation: %v", err)
	}

	// Initialize the global pointer
	Storage = &storage.S3Provider{
		Client:     client,
		BucketName: bucket,
	}

	return nil
}
