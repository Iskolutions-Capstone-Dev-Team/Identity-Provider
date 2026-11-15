package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/minio/minio-go/v7"
)

type S3Provider struct {
	Client         *minio.Client
	BucketName     string
	PublicEndpoint string
}

// UploadOrReplace saves a file to MinIO.
// If the fileName already exists in the bucket, it is overwritten.
func (s *S3Provider) UploadOrReplace(
	ctx context.Context,
	fileName string,
	reader io.Reader,
	size int64,
	contentType string,
) error {
	_, err := s.Client.PutObject(ctx, s.BucketName, fileName,
		reader, size, minio.PutObjectOptions{
			ContentType: contentType,
		})
	if err != nil {
		return fmt.Errorf("[S3Provider] PutObject: %w", err)
	}

	return nil
}

// UploadToBucket saves a file to a specific bucket in MinIO/S3.
func (s *S3Provider) UploadToBucket(
	ctx context.Context,
	bucketName string,
	fileName string,
	reader io.Reader,
	size int64,
	contentType string,
) error {
	if bucketName == "" {
		bucketName = s.BucketName
	}
	_, err := s.Client.PutObject(ctx, bucketName, fileName,
		reader, size, minio.PutObjectOptions{
			ContentType: contentType,
		})
	if err != nil {
		return fmt.Errorf("[S3Provider] PutObject to bucket %s: %w", bucketName, err)
	}

	return nil
}

