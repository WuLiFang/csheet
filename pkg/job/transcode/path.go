package transcode

import (
	"os"
	"path"
	"path/filepath"

	"github.com/WuLiFang/csheet/pkg/filestore"
)

func replaceExt(v string, ext string) string {
	e := path.Ext(v)
	if e == ext {
		return v
	}
	return v[:len(v)-len(e)] + ext
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
