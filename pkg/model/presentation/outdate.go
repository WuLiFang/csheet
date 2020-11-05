package presentation

import "github.com/WuLiFang/csheet/v6/pkg/db"

// IterateOutdated presentation.
func IterateOutdated(fn func(p Presentation) error) error {
	return db.View(func(txn *db.Txn) (err error) {
		opts := db.DefaultIteratorOptions
		opts.PrefetchValues = false
		it := txn.NewIterator(opts)
		defer it.Close()
		prefix := db.IndexPresentationOutdated.Bytes()
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			var pk string
			_, err = db.UnmarshalKey(it.Item().Key(), &pk)
			if err != nil {
				return
			}
			var v Presentation
			v, err = FindByID(keyToID(db.IndexPresentation.Key(pk)))
			if err != nil {
				return
			}
			err = fn(v)
			if err != nil {
				return
			}
		}
		return
	})
}
