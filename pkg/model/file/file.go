package file

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/dgraph-io/badger/v2"
	"go.uber.org/zap"
)

//go:generate gotmpl -o file_gen.go ../model.go.gotmpl
//go:generate gotmpl -o signal_gen.go  Type=*File ../signal.go.gotmpl ../model_signals.gotmpl

// File data
// change data not affect file on dist.
// should only delete record after file deleted.
type File struct {
	Path    string
	ModTime time.Time
	Size    int64
}

// Key for db.
func (f File) Key() ([]byte, error) {
	return db.IndexFile.Key(f.Path), nil
}

// Tag is a weak file content id.
// Computed from mod time and size.
func (f File) Tag() string {
	if f.Size == 0 {
		return ""
	}
	return fmt.Sprintf("%x-%x", f.ModTime.UnixNano(), f.Size)
}

// Stat update file stat data.
func (f *File) Stat(ctx context.Context) error {
	p, err := filestore.AbsPath(f.Path)
	if err != nil {
		return err
	}
	s, err := os.Stat(p)
	if err != nil {
		return err
	}
	var changed bool
	modTime := s.ModTime()
	if modTime.Unix() != f.ModTime.Unix() {
		changed = true
		f.ModTime = modTime
	}
	size := s.Size()
	if size != f.Size {
		changed = true
		f.Size = size
	}
	if changed {
		logging.Logger("model.file").Info("change detected", zap.Any("file", f))
		f.Save(ctx)
	}
	return nil
}

// FindByPath find path matched file.
func FindByPath(p string) (ret File, err error) {
	err = db.View(func(txn *db.Txn) error {
		return txn.Get(db.IndexFile.Key(p), &ret)
	})
	return
}

// FindOrCreateByPath find path matched file, create one if not found.
func FindOrCreateByPath(ctx context.Context, p string) (ret File, err error) {
	ret, err = FindByPath(p)
	if err == db.ErrKeyNotFound {
		ret = File{Path: p}
		err = ret.Save(ctx)
	}
	return
}

// Scan all saved file.
func Scan(fn func(v File) bool) error {
	return db.View(func(txn *db.Txn) error {
		cur := txn.NewIterator(badger.DefaultIteratorOptions)
		defer cur.Close()
		prefix := db.IndexFile.Bytes()
		for cur.Seek(prefix); cur.ValidForPrefix(prefix); cur.Next() {
			var v File
			err := cur.Item().Value(func(data []byte) error {
				return db.UnmarshalValue(data, &v)
			})

			if err != nil {
				return err
			}
			if !fn(v) {
				break
			}
		}
		return nil
	})
}

// IsFile implements graphql File interface.
func (File) IsFile() {}
