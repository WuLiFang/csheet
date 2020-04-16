package filestore

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"os"
	"path"
	"path/filepath"
)

// Dir to store files
var Dir = "storage/files"

// pathByHash compute normalized path
// from file content hash and filename.
func pathByHash(filename string) (ret string, err error) {
	f, err := os.Open(filename)
	if err != nil {
		return
	}
	defer f.Close()
	h := sha256.New()
	_, err = io.Copy(h, f)
	if err != nil {
		return
	}
	v := hex.EncodeToString(h.Sum(nil))
	ret = path.Join(v[:2], v[2:4], v[4:], filepath.Base(filename))
	return
}
