package migrations

import "github.com/dgraph-io/badger/v2"

func dropCollectedEventTable(db *badger.DB) error {
	return db.View(func(txn *badger.Txn) error {
		prefix := []byte{0x00, 0x02}
		cur := txn.NewIterator(badger.IteratorOptions{
			Prefix: prefix,
		})
		defer cur.Close()
		for cur.Seek(prefix); cur.ValidForPrefix(prefix); cur.Next() {
			err := db.Update(func(txn *badger.Txn) error {
				return txn.Delete(cur.Item().KeyCopy(nil))
			})
			if err != nil {
				return err
			}
		}
		return nil
	})
}
