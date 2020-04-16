package collected

import (
	"encoding/base64"
	"time"

	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/dgraph-io/badger/v2"
)

// Event record a finished collect action.
type Event struct {
	OriginPrefix string
	Time         time.Time
	UpdatedCount int
}

func (e Event) key() ([]byte, error) {
	return db.IndexCollectedEvent.Key(db.TimeStamp(e.Time)), nil
}

// ID string for gallery
func (e Event) ID() string {
	key, err := e.key()
	if err != nil {
		logger.Errorw("invalid id", "error", err)
		return ""
	}
	return base64.RawURLEncoding.EncodeToString(key)
}

// IsNode implements graphql Node interface.
func (Event) IsNode() {}

// Save to db.
func (e *Event) Save() error {
	if e.Time.IsZero() {
		e.Time = time.Now()
	}
	k, err := e.key()
	if err != nil {
		return err
	}
	err = db.Update(func(txn *db.Txn) (err error) {
		return txn.Set(k, e)
	})
	if err != nil {
		return err
	}
	SignalUpdated.Emit(*e)
	return nil
}

// Scan all saved event.
func Scan(fn func(v Event) bool) error {
	return db.View(func(txn *db.Txn) error {
		cur := txn.NewIterator(badger.DefaultIteratorOptions)
		defer cur.Close()
		prefix := db.IndexCollectedEvent.Bytes()
		for cur.Seek(prefix); cur.ValidForPrefix(prefix); cur.Next() {
			var v Event
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

// FindByID find id matched gallery.
func FindByID(id string) (ret Event, err error) {
	key, err := base64.RawURLEncoding.DecodeString(id)
	if err != nil {
		return
	}
	err = db.View(func(txn *db.Txn) error {
		return txn.Get(key, &ret)
	})
	return
}
