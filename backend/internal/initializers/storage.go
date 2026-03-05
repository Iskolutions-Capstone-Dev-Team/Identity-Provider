package initializers

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var Storage *storage.S3Provider

func NewS3Storage() error {
	endpoint := os.Getenv("S3_PUBLIC_HOST") 
	internal := os.Getenv("S3_ENDPOINT")    

	accessKey := os.Getenv("S3_KEY")
	secretKey := os.Getenv("S3_SECRET")
	useSSL := os.Getenv("S3_USE_SSL") == "true"

	// Custom transport to redirect the Go client's internal traffic
	transport := &http.Transport{
		DialContext: func(ctx context.Context, netw, addr string) (net.Conn, error) {
			// Redirect Go's internal calls from localhost to the minio service
			if addr == endpoint {
				addr = internal
			}
			return (&net.Dialer{}).DialContext(ctx, netw, addr)
		},
	}

	client, err := minio.New(endpoint, &minio.Options{
		Creds:     credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure:    useSSL,
		Transport: transport,
	})
	if err != nil {
		return fmt.Errorf("[StorageInit] Client Creation: %v", err)
	}

	Storage = &storage.S3Provider{
		Client:     client,
		BucketName: os.Getenv("S3_BUCKET"),
	}
	return nil
}
