package transcode

import (
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/WuLiFang/csheet/pkg/filestore"
	"github.com/WuLiFang/csheet/pkg/model/file"
)

func replaceExt(v string, ext string) string {
	e := path.Ext(v)
	if e == ext {
		return v
	}
	return v[:len(v)-len(e)] + ext
}

func isExists(v string) bool {
	_, err := file.FindByPath(v)
	if err == nil {
		return true
	}
	if err == db.ErrKeyNotFound {
		return false
	}
	if err != nil {
		logger.Errorw("db error", "error", err)
	}
	return true
}

func modTime(v string) time.Time {
	f, err := file.FindByPath(v)
	if err == db.ErrKeyNotFound {
		err = nil
	}
	if err != nil {
		logger.Errorw("db error", "error", err)
	}
	return f.ModTime
}

func removeStoreFile(v string) (err error) {
	if v == "" || filepath.IsAbs(v) {
		return
	}
	p, err := filestore.AbsPath(v)
	if err != nil {
		return
	}
	err = os.Remove(p)
	return
}
