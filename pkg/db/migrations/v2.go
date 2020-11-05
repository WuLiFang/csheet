package migrations

import (
	"bytes"
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"strconv"
	"time"

	"github.com/dgraph-io/badger/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/bsonrw"
	"go.mongodb.org/mongo-driver/bson/bsontype"
)

func base64ID(stringID string) (ret []byte, err error) {
	num, err := strconv.ParseUint(stringID, 10, 64)
	if err != nil {
		return
	}
	var data = make([]byte, 8)
	binary.BigEndian.PutUint64(data, num)
	for len(data) > 1 && data[0] == 0x00 {
		data = data[1:]
	}
	ret = make([]byte, base64.RawURLEncoding.EncodedLen(len(data)))
	base64.RawURLEncoding.Encode(ret, data)
	return
}

func renameEntry(txn *badger.Txn, oldKey, newKey []byte) (err error) {
	if bytes.Equal(oldKey, newKey) {
		return nil
	}
	item, err := txn.Get(oldKey)
	if err != nil {
		return
	}
	_, err = txn.Get(newKey)
	if err != badger.ErrKeyNotFound {
		return fmt.Errorf("key already existed: %q", newKey)
	}

	err = item.Value(func(val []byte) error {
		var entry = badger.NewEntry(
			newKey,
			val,
		)
		expireAt := time.Unix(int64(item.ExpiresAt()), 0)
		if !expireAt.IsZero() {
			entry = entry.WithTTL(expireAt.Sub(time.Now()))
		}
		return txn.SetEntry(entry)
	})
	if err != nil {
		return
	}
	err = txn.Delete(oldKey)
	if err != nil {
		return
	}
	return
}

func ignoreKeyNotFound(err error) error {
	if err == badger.ErrKeyNotFound {
		return nil
	}
	return err
}
func unmarshalBSONString(v []byte) string {
	if v[0] != 0x02 {
		panic("not a bson string")
	}
	return string(v[5 : len(v)-1])
}

type v2Collection struct {
	Origin          string
	Title           string
	Metadata        map[string]string
	CollectTime     time.Time
	PresentationIDs []string
}

func v2UnmarshalValue(data []byte, v interface{}) error {
	vr := bsonrw.NewBSONValueReader(bsontype.Type(data[0]), data[1:])
	dec, err := bson.NewDecoder(vr)
	if err != nil {
		return err
	}
	return dec.Decode(v)
}

func v2MarshalValue(v interface{}) (ret []byte, err error) {
	if v == nil {
		return
	}
	t, data, err := bson.MarshalValue(v)
	ret = append(ret, byte(t))
	ret = append(ret, data...)
	return
}

func useBase64ID(db *badger.DB) error {
	return db.Update(func(txn *badger.Txn) (err error) {
		cur := txn.NewIterator(badger.IteratorOptions{})
		defer cur.Close()
		for cur.Seek([]byte{}); cur.Valid(); cur.Next() {
			item := cur.Item()
			key := item.KeyCopy(nil)
			if key[0] != 0x00 {
				return fmt.Errorf("unknown database key: %q", key)
			}
			switch key[1] {

			// collection
			case 0x03:
				var oldID = string(key[2 : len(key)-1])
				var newID []byte
				newID, err = base64ID(oldID)
				if err != nil {
					return
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
						var newID []byte
						newID, err = base64ID(string(idData[2 : len(idData)-1]))
						if err != nil {
							return
						}
						doc.PresentationIDs[i] = base64.RawURLEncoding.EncodeToString(
							append(append(append([]byte{}, idData[:2]...), newID...), 0x09),
						)
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
						append(append(append(make([]byte, 0, 2+len(newID)), key[:2]...), newID...), 0x09),
						newValue,
					)
				})
				err = txn.Delete(key)
				if err != nil {
					return err
				}

			// primary key
			case 0x05:
				var oldID = string(key[2 : len(key)-1])
				var newID []byte
				newID, err = base64ID(oldID)
				if err != nil {
					return
				}
				err = renameEntry(txn,
					key,
					append(append(append(make([]byte, 0, 2+len(newID)), key[:2]...), newID...), 0x09),
				)
				if err != nil {
					return err
				}

			// primary id
			case 0x09:
				var oldB64ID = string(key[2 : len(key)-1])
				var oldIDData []byte
				oldIDData, err = base64.RawURLEncoding.DecodeString(oldB64ID)
				if err != nil {
					return
				}
				var oldID = string(oldIDData[2 : len(oldIDData)-1])
				var newID []byte
				newID, err = base64ID(oldID)
				if err != nil {
					return
				}
				err = renameEntry(txn,
					key,
					append(append(append(make([]byte, 0, 2+len(newID)), key[:2]...), newID...), 0x09),
				)
				if err != nil {
					return err
				}

			// secondary key
			case 0x04:
				fallthrough
			case 0x06:
				err = item.Value(func(val []byte) (err error) {
					oldID := unmarshalBSONString(val)
					newID, err := base64ID(oldID)
					if err != nil {
						return
					}
					err = txn.Set(key, newID)
					if err != nil {
						return
					}
					return
				})
				if err != nil {
					return err
				}

			// secondary id
			case 0x08:
				var pathEnd = bytes.IndexByte(key, 0x09)
				var path = key[2:pathEnd]
				var oldB64ID = string(key[pathEnd+1 : len(key)-1])
				var oldIDData []byte
				oldIDData, err = base64.RawURLEncoding.DecodeString(oldB64ID)
				if err != nil {
					return
				}
				if oldIDData[0] != 0x00 && oldIDData[0] != 0x05 {
					return fmt.Errorf("invalid presentation id: %x", key)
				}
				var oldID = string(oldIDData[2 : len(oldIDData)-1])
				var newID []byte
				newID, err = base64ID(oldID)
				if err != nil {
					return
				}
				err = renameEntry(
					txn,
					key,
					append(append(append(append(append(make([]byte, 0, 16), key[:2]...), path...), 0x09), newID...), 0x09),
				)
				if err != nil {
					return
				}

			case 0x00:
			case 0x01:
			case 0x07:
			case 0x0a:
			default:
				return fmt.Errorf("unknown database key: %q", key)
			}
		}
		return nil
	})
}
