package service

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/utils"
	"github.com/minio/minio-go/v7"
)

// ProcessAndUploadIcon handles validation, seeking, and the S3 transfer
func ProcessAndUploadIcon(
	ctx context.Context,
	name string,
	fileReader io.ReadSeeker,
	size int64,
	storage *storage.S3Provider,
) (string, error) {
	if storage == nil {
		return "", fmt.Errorf("[MediaService] Storage provider is not initialized")
	}

	// 1. Validate Header
	header := make([]byte, 512)
	if _, err := fileReader.Read(header); err != nil {
		return "", fmt.Errorf("[MediaService] Header Read: %v", err)
	}

	if err := utils.ValidateImage(header, name); err != nil {
		return "", err
	}

	// 2. Detect Content Type
	contentType := http.DetectContentType(header)

	// 3. Reset for full upload
	if _, err := fileReader.Seek(0, 0); err != nil {
		return "", fmt.Errorf("[MediaService] File Seek: %v", err)
	}

	// 4. Construct Final Path using client name as key
	finalPath := fmt.Sprintf("icons/%s", name)

	// 5. Execute Upload (S3Provider handles the 'Replace' logic naturally)
	err := storage.UploadOrReplace(
		ctx,
		finalPath,
		fileReader,
		size,
		contentType,
	)
	if err != nil {
		return "", err
	}

	return finalPath, nil
}

// GetPresignedURL generates a temporary link for the frontend
func GetPresignedURL(ctx context.Context,
	object string, storage *storage.S3Provider,
) (string, error) {
	if storage == nil || storage.Client == nil {
		return "", fmt.Errorf("[MediaService] Storage provider is not initialized")
	}
	if object == "" {
		return "", nil
	}

	// Clean path for S3 standards
	object = strings.TrimPrefix(object, "/")
	expiry := time.Second * 3600

	isMinio := false
	var internalHost string
	endpointURL := storage.Client.EndpointURL()
	if endpointURL != nil {
		internalHost = endpointURL.Host
		isMinio = strings.Contains(internalHost, "minio")
	}

	if isMinio {
		publicURL := fmt.Sprintf("http://%s/%s/%s",
			storage.PublicEndpoint,
			storage.BucketName,
			object)
		return publicURL, nil
	}

	presignedURL, err := storage.Client.PresignedGetObject(
		ctx,
		storage.BucketName,
		object,
		expiry,
		nil,
	)
	if err != nil {
		return "", err
	}

	urlStr := presignedURL.String()

	if endpointURL != nil {
		if storage.PublicEndpoint != "" && storage.PublicEndpoint != internalHost {
			urlStr = strings.Replace(urlStr, internalHost,
				storage.PublicEndpoint, 1)
		}
	}

	return urlStr, nil
}

func DeleteImage(ctx context.Context, object string,
	storage *storage.S3Provider,
) error {
	if storage == nil || storage.Client == nil {
		return fmt.Errorf("[DeleteImage] Storage provider is not initialized")
	}

	// RemoveObject options can be used for versioning or governance bypass
	opts := minio.RemoveObjectOptions{}

	err := storage.Client.RemoveObject(ctx, storage.BucketName, object, opts)
	if err != nil {
		return fmt.Errorf("[DeleteClientImage] MinIO RemoveObject: %v", err)
	}

	return nil
}
