package collected

import (
	"context"
	"encoding/base64"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/dgraph-io/badger/v2"
)

//go:generate gotmpl -o event_gen.go ../../model.go.gotmpl
//go:generate gotmpl -o signal_gen.go Type=*Event ../../signal.go.gotmpl ../../model_signals.gotmpl

// Event record a finished collect action.
type Event struct {
	OriginPrefix string
	Time         time.Time
	UpdatedCount int
}

// Key for db.
func (e Event) Key() ([]byte, error) {
	return db.IndexCollectedEvent.Key(db.TimeStamp(e.Time)), nil
}

func init() {
	SignalWillSave.Connect(func(ctx context.Context, e *Event) error {
		if e.Time.IsZero() {
			e.Time = time.Now()
		}
		return nil
	})
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
