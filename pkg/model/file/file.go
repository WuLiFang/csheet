package file

import (
	"fmt"
	"os"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/dgraph-io/badger/v2"
)

// File data
type File struct {
	Path    string
	ModTime time.Time
	Size    int64
}

func (f File) key() []byte {
	return db.IndexFile.Key(f.Path)
}

// Tag is a weak file content id.
// Computed from mod time and size.
func (f File) Tag() string {
	if f.Size == 0 {
		return ""
	}
	return fmt.Sprintf("%x-%x", f.ModTime.UnixNano(), f.Size)
}

// Save file to db.
func (f File) Save() (err error) {
	return db.Update(func(txn *db.Txn) error {
		return txn.Set(f.key(), f)
	})
}

// Delete from db, not affect file on dist.
// should only delete record after file deleted.
func (f File) Delete() error {
	return db.Update(func(txn *db.Txn) error {
		SignalDeleted.emit(f)
		return txn.Delete(f.key())
	})
}

// Stat update file stat data.
func (f *File) Stat() error {
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
		f.Save()
		SignalChanged.emit(*f)
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
func FindOrCreateByPath(p string) (ret File, err error) {
	ret, err = FindByPath(p)
	if err == db.ErrKeyNotFound {
		ret = File{Path: p}
		err = ret.Save()
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
