package presentation

import (
	"github.com/WuLiFang/csheet/pkg/db"
)

// FindByPath returns presentation used this file.
func FindByPath(path string) (ret []Presentation, err error) {
	err = db.View(func(txn *db.Txn) error {
		opts := db.DefaultIteratorOptions
		opts.PrefetchValues = false
		it := txn.NewIterator(opts)
		defer it.Close()
		var prefix = db.IndexPresentationFile.Key(path)
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			key := it.Item().Key()
			var id string
			_, err := db.UnmarshalKey(key, nil, &id)
			if err != nil {
				return err
			}
			p, err := FindByID(id)
			if err == db.ErrKeyNotFound {
				err = nil
			}
			if err != nil {
				return err
			}
			if !(p.Raw == path ||
				p.Thumb == path ||
				p.Regular == path) {
				// Outdated index
				db.Delete(key)
				continue
			}
			ret = append(ret, p)
		}
		return nil
	})
	return
}
