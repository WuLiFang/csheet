package filestore

import (
	"os"
	"os/exec"
	"path/filepath"
)

var mv, mvLookupErr = exec.LookPath("mv")

// Put move file to store.
// returns normalized path.
func Put(filename string) (ret string, err error) {
	ret, err = pathByHash(filename)
	if err != nil {
		return
	}
	dst, err := AbsPath(ret)
	if err != nil {
		return
	}
	err = os.MkdirAll(filepath.Dir(dst), 0x600)
	if err != nil {
		return
	}
	err = os.Rename(filename, dst)
	if err != nil {
		if mvLookupErr == nil {
			err = exec.Command(mv, filename, dst).Run()
			return
		}
	}
	return
}
