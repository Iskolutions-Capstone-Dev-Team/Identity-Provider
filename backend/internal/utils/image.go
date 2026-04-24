package utils

import (
	"errors"
	"net/http"
	"path/filepath"
	"strings"
)

var AllowedImageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".svg":  true,
	".webp": true,
}

func ValidateImage(header []byte, filename string) error {
	ext := strings.ToLower(filepath.Ext(filename))
	if !AllowedImageExtensions[ext] {
		return errors.New("unsupported file extension")
	}

	mimeType := http.DetectContentType(header)
	if !strings.HasPrefix(mimeType, "image/") {
		return errors.New("file content is not a valid image")
	}

	return nil
}
