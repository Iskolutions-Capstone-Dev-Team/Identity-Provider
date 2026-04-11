package initializers

import (
	"context"
	"fmt"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var Storage *storage.S3Provider

func NewS3Storage() error {
	// 1. Use the clean endpoint (no https://)
	endpoint := os.Getenv("S3_ENDPOINT")
	accessKey := os.Getenv("S3_KEY")
	secretKey := os.Getenv("S3_SECRET")
	useSSL := os.Getenv("S3_USE_SSL") == "true"
	bucket := os.Getenv("S3_BUCKET")
	publicEndpoint := os.Getenv("S3_PUBLIC_HOST")

	// 2. Defensive check: stop before the nil pointer happens
	if endpoint == "" || accessKey == "" || secretKey == "" {
		return fmt.Errorf("[StorageInit] Missing S3 environment variables")
	}

	// 3. Create the client
	client, err := createClient(endpoint, accessKey, secretKey, useSSL)
	if err != nil {
		return fmt.Errorf("[StorageInit] Client Creation: %v", err)
	}

	// 4. Assign to global variable
	Storage = &storage.S3Provider{
		Client:         client,
		BucketName:     bucket,
		PublicEndpoint: publicEndpoint,
	}

	// 5. [Crucial] Verify connection immediately so it fails here, not at line 26
	_, err = client.BucketExists(context.Background(), bucket)
	if err != nil {
		return fmt.Errorf("[StorageInit] Connection/Bucket Check: %v", err)
	}

	return nil
}

func createClient(endpoint, accessKey, secretKey string,
	useSSL bool,
) (*minio.Client, error) {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("[StorageInit] Client Creation: %v", err)
	}

	return client, nil
}
