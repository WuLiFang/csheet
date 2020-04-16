package filestore

import (
	"io"
	"os"
	"path/filepath"
	"time"

	"gopkg.in/djherbis/times.v1"
)

// SetAccessTime of file, keep modification time.
func SetAccessTime(p string, t time.Time) error {
	stat, err := os.Stat(p)
	if err != nil {
		return err
	}
	return os.Chtimes(p, time.Now(), stat.ModTime())
}

// AccessTime for a file
func AccessTime(p string) (ret time.Time, err error) {
	stat, err := times.Stat(p)
	if err != nil {
		return
	}
	ret = stat.AccessTime()
	return
}

func removeEmptyFolder(p string) (err error) {
	if p == "." {
		return
	}
	logger.Debugw("check empty folder", "path", p, "parent", filepath.Dir(p))
	f, err := os.Open(p)
	if err != nil {
		return err
	}
	_, err = f.Readdirnames(1)
	f.Close()
	if err == io.EOF {
		os.Remove(p)
		logger.Infow("remove empty folder", "path", p)
		return removeEmptyFolder(filepath.Dir(p))
	}
	return err
}

// Prune remove files that atime before given time
func Prune(root string, atimeBefore time.Time) (count int, err error) {
	err = filepath.Walk(root, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return removeEmptyFolder(p)
		}
		atime, err := AccessTime(p)
		if err != nil {
			return err
		}
		if !atime.IsZero() && atime.Before(atimeBefore) {
			logger.Infow("Remove file", "path", p)
			os.Remove(p)
			count++
		}
		return nil
	})

	return
}
