package migrations

import "github.com/dgraph-io/badger/v2"

func dropCollectedEventTable(db *badger.DB) error {
	return db.Update(func(txn *badger.Txn) error {
		prefix := []byte{0x00, 0x02}
		cur := txn.NewIterator(badger.IteratorOptions{
			Prefix: prefix,
		})
		defer cur.Close()
		for cur.Seek(prefix); cur.ValidForPrefix(prefix); cur.Next() {
			err := txn.Delete(cur.Item().Key())
			if err != nil {
				return err
			}
		}
		return nil
	})
}
