package service

import (
	"context"
	"fmt"
	"io"
	"net/http"

	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/auth"
	"github.com/Iskolutions-Capstone-Dev-Team/Identity-Provider/internal/initializers"
)

// ProcessAndUploadIcon handles validation, seeking, and the S3 transfer
func ProcessAndUploadIcon(
	ctx context.Context,
	tag string,
	fileName string,
	fileReader io.ReadSeeker,
	size int64,
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
	finalPath := fmt.Sprintf("icons/%s-%s", tag, fileName)

	// 5. Execute Upload (S3Provider handles the 'Replace' logic naturally)
	err := initializers.Storage.UploadOrReplace(
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
