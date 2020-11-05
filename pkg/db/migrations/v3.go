package migrations

import (
	"encoding/base64"
	"fmt"

	"github.com/dgraph-io/badger/v2"
)

func removeCommonKeySuffix(db *badger.DB) error {
	return db.View(func(txn *badger.Txn) (err error) {
		cur := txn.NewIterator(badger.IteratorOptions{})
		defer cur.Close()
		for cur.Seek([]byte{}); cur.Valid(); cur.Next() {
			err = db.Update(
				func(txn *badger.Txn) (err error) {
					item := cur.Item()
					key := item.KeyCopy(nil)
					if key[0] != 0x00 {
						return fmt.Errorf("unknown database key: %q", key)
					}
					switch key[1] {

					// key only
					case 0x01:
						fallthrough
					case 0x04:
						fallthrough
					case 0x05:
						fallthrough
					case 0x06:
						fallthrough
					case 0x07:
						fallthrough
					case 0x08:
						fallthrough
					case 0x09:
						fallthrough
					case 0x0a:
						if key[len(key)-1] != 0x09 {
							return fmt.Errorf("invalid key: %q", key)
						}
						err = renameEntry(txn,
							key,
							key[:len(key)-1],
						)
						if err != nil {
							return err
						}

					// collection
					case 0x03:
						if key[len(key)-1] != 0x09 {
							return fmt.Errorf("invalid key: %q", key)
						}
						item.Value(func(val []byte) (err error) {
							var doc = new(v2Collection)
							err = v2UnmarshalValue(val, doc)
							if err != nil {
								return
							}
							for i := range doc.PresentationIDs {
								var v = doc.PresentationIDs[i]
								var idData []byte
								idData, err = base64.RawURLEncoding.DecodeString(v)
								if err != nil {
									return
								}
								if idData[len(idData)-1] != 0x09 {
									return fmt.Errorf("invalid id: %q", idData)
								}
								doc.PresentationIDs[i] = base64.RawURLEncoding.EncodeToString(idData[:len(idData)-1])
								if err != nil {
									return
								}
							}
							var newValue []byte
							newValue, err = v2MarshalValue(doc)
							if err != nil {
								return
							}
							return txn.Set(
								key[:len(key)-1],
								newValue,
							)
						})
						err = txn.Delete(key)
						if err != nil {
							return err
						}

					case 0x00:
					default:
						return fmt.Errorf("unknown database key: %q", key)
					}
					return
				})
			if err != nil {
				return
			}

		}
		return nil
	})
}
