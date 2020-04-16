package filestore

import (
	"path/filepath"
	"strings"
)

// NormalizePath convert path inside storage dir to relative path.
// outside storage dir to absolute path.
// relative path considered inside storage dir.
func NormalizePath(p string) (ret string, err error) {
	ret = p
	if filepath.IsAbs(ret) {
		var base string
		base, err = filepath.Abs(Dir)
		if err != nil {
			return
		}
		ret = filepath.Clean(ret)
		if strings.HasPrefix(ret, base) {
			ret = ret[len(base)+1:]
		}
	}
	ret = filepath.ToSlash(ret)
	return
}

// AbsPath convert path to absolute path,
// when path is relative, it will relative to file storage dir.
func AbsPath(p string) (ret string, err error) {
	ret = filepath.FromSlash(p)
	if !filepath.IsAbs(ret) {
		base, err := filepath.Abs(Dir)
		if err != nil {
			return ret, err
		}
		ret = filepath.Join(base, p)
	}
	ret, err = filepath.Abs(ret)
	return
}
