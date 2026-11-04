package api

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	swaggerFiles "github.com/swaggo/files/v2"
	"golang.org/x/net/webdav"
)

type webdavFS struct {
	fs fs.FS
}

func (w *webdavFS) Mkdir(
	ctx context.Context,
	name string,
	perm os.FileMode,
) error {
	return os.ErrPermission
}

func (w *webdavFS) RemoveAll(ctx context.Context, name string) error {
	return os.ErrPermission
}

func (w *webdavFS) Rename(
	ctx context.Context,
	oldName, newName string,
) error {
	return os.ErrPermission
}

func (w *webdavFS) Stat(
	ctx context.Context,
	name string,
) (os.FileInfo, error) {
	clean := strings.TrimPrefix(filepath.ToSlash(filepath.Clean(name)), "/")
	if clean == "" || clean == "." {
		clean = "."
	}
	return fs.Stat(w.fs, clean)
}

func (w *webdavFS) OpenFile(
	ctx context.Context,
	name string,
	flag int,
	perm os.FileMode,
) (webdav.File, error) {
	if flag&(os.O_WRONLY|os.O_RDWR|os.O_CREATE|os.O_TRUNC) != 0 {
		return nil, os.ErrPermission
	}
	clean := strings.TrimPrefix(filepath.ToSlash(filepath.Clean(name)), "/")
	if clean == "" || clean == "." {
		clean = "."
	}
	f, err := w.fs.Open(clean)
	if err != nil {
		return nil, err
	}
	return &webdavFile{File: f}, nil
}

type webdavFile struct {
	fs.File
}

func (f *webdavFile) Seek(offset int64, whence int) (int64, error) {
	if s, ok := f.File.(io.Seeker); ok {
		return s.Seek(offset, whence)
	}
	return 0, fmt.Errorf("seek not supported")
}

func (f *webdavFile) Readdir(count int) ([]os.FileInfo, error) {
	if r, ok := f.File.(fs.ReadDirFile); ok {
		entries, err := r.ReadDir(count)
		if err != nil {
			return nil, err
		}
		infos := make([]os.FileInfo, len(entries))
		for i, e := range entries {
			info, err := e.Info()
			if err != nil {
				return nil, err
			}
			infos[i] = info
		}
		return infos, nil
	}
	return nil, fmt.Errorf("readdir not supported")
}

func (f *webdavFile) Write(p []byte) (n int, err error) {
	return 0, os.ErrPermission
}

// NewSwaggerHandler returns a webdav.Handler backed by swaggerFiles.FS v2.
func NewSwaggerHandler() *webdav.Handler {
	return &webdav.Handler{
		FileSystem: &webdavFS{fs: swaggerFiles.FS},
		LockSystem: webdav.NewMemLS(),
	}
}

