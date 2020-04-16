package filestore

import (
	"io/ioutil"
	"os"
)

// TempDir to store temporary files.
var TempDir = ""

// WithTempFile wraps ioutil.TempFile.
func WithTempFile(pattern string, fn func(f *os.File) error) (err error) {
	if TempDir != "" {
		os.MkdirAll(TempDir, 0x600)
	}
	f, err := ioutil.TempFile(TempDir, pattern)
	if err != nil {
		return
	}
	defer func() {
		f.Close()
		os.Remove(f.Name())
	}()
	err = fn(f)
	return
}

// WithTempDir create a tempdir to use and do cleanup when fn finished.
func WithTempDir(pattern string, fn func(dir string) error) (err error) {
	if TempDir != "" {
		os.MkdirAll(TempDir, 0x600)
	}
	name, err := ioutil.TempDir(TempDir, pattern)
	if err != nil {
		return
	}
	defer os.RemoveAll(name)
	err = fn(name)
	return
}
