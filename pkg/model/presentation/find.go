package presentation

import (
	"github.com/WuLiFang/csheet/pkg/db"
)

// FindByRaw returns presentation used this file as raw.
func FindByRaw(raw string) (ret []Presentation, err error) {
	err = db.View(func(txn *db.Txn) error {
		opts := db.DefaultIteratorOptions
		opts.PrefetchValues = false
		it := txn.NewIterator(opts)
		defer it.Close()
		var prefix = db.IndexPresentationRaw.Key(raw)
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
			if p.Raw != raw {
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
