package service

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/auth"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/storage"
	"github.com/minio/minio-go/v7"
)

// ProcessAndUploadIcon handles validation, seeking, and the S3 transfer
func ProcessAndUploadIcon(
	ctx context.Context,
	tag string,
	fileName string,
	fileReader io.ReadSeeker,
	size int64,
	storage *storage.S3Provider,
) (string, error) {
	// 1. Validate Header
	header := make([]byte, 512)
	if _, err := fileReader.Read(header); err != nil {
		return "", fmt.Errorf("[MediaService] Header Read: %v", err)
	}

	if err := auth.ValidateImage(header, fileName); err != nil {
		return "", err
	}

	// 2. Detect Content Type
	contentType := http.DetectContentType(header)

	// 3. Reset for full upload
	if _, err := fileReader.Seek(0, 0); err != nil {
		return "", fmt.Errorf("[MediaService] File Seek: %v", err)
	}

	// 4. Construct Final Path
	finalPath := fmt.Sprintf("icons/%s", tag)

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
	// Clean path for S3 standards
	object = strings.TrimPrefix(object, "/")
	expiry := time.Second * 3600

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
	internalHost := storage.Client.EndpointURL().Host

	if storage.PublicEndpoint != "" && storage.PublicEndpoint != internalHost {
		urlStr = strings.Replace(urlStr, internalHost,
			storage.PublicEndpoint, 1)
	}

	return urlStr, nil
}

func DeleteImage(ctx context.Context, object string,
	storage *storage.S3Provider,
) error {
	// RemoveObject options can be used for versioning or governance bypass
	opts := minio.RemoveObjectOptions{}

	err := storage.Client.RemoveObject(ctx, storage.BucketName, object, opts)
	if err != nil {
		return fmt.Errorf("[DeleteClientImage] MinIO RemoveObject: %v", err)
	}

	return nil
}
