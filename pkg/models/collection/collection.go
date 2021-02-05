package collection

import (
	"context"
	"encoding/base64"
	"errors"
	"sort"
	"sync"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/models/mixins"
	"github.com/WuLiFang/csheet/v6/pkg/util"
)

//go:generate gotmpl -o collection_gen.go ../model.go.gotmpl
//go:generate gotmpl -o signal_gen.go  Type=*Collection ../signal.go.gotmpl ../model_signals.gotmpl

// Collection belongs to a gallery.
type Collection struct {
	Origin          string
	Title           string            `bson:",omitempty"`
	Metadata        map[string]string `bson:",omitempty"`
	CollectTime     time.Time
	PresentationIDs []string `bson:",omitempty"`
	Tags            []string `bson:",omitempty"`

	onSaved mixins.DeferredOperations
}

func (c Collection) pk() (ret string, err error) {
	if c.Origin == "" {
		return "", errors.New("Collection.pk: missing origin")
	}
	return db.IndexCollectionOrigin.ValueID(c.Origin)
}

// Key for db
func (c Collection) Key() ([]byte, error) {
	var id, err = c.pk()
	if err != nil {
		return nil, err
	}
	return db.IndexCollection.Key(id), err
}

// Validate and clean up data
func (c *Collection) Validate(ctx context.Context) (err error) {
	c.PresentationIDs = util.StringUniq(c.PresentationIDs)
	c.Tags = util.StringUniq(c.Tags)
	sort.Strings(c.Tags)
	return
}

// FindByID find id matched collection.
func FindByID(ctx context.Context, id string) (ret *Collection, err error) {
	key, err := base64.RawURLEncoding.DecodeString(id)
	if err != nil {
		return
	}
	err = db.View(func(txn *db.Txn) (err error) {
		ret = new(Collection)
		err = txn.Get(key, ret)
		if err != nil {
			return
		}
		err = SignalLoaded.Emit(ctx, ret)
		return
	})
	return
}

var deferUntilSavedSetupOnce = new(sync.Once)

// DeferUntilSaved add a operation to execute after save.
func (c *Collection) DeferUntilSaved(fn func(ctx context.Context) error) {
	deferUntilSavedSetupOnce.Do(func() {
		// not setup in init, so deferred operation can execute after init registered callback,
		var onSaved = func(ctx context.Context, o *Collection) error {
			return o.onSaved.Apply(ctx)
		}
		SignalSaved.Connect(onSaved)
	})
	c.onSaved.Append(fn)
}

func init() {
	SignalLoaded.Connect(func(ctx context.Context, c *Collection) error {
		pk, err := c.pk()
		if err != nil {
			return err
		}

		for _, i := range c.Tags {
			var tag = i
			c.DeferUntilSaved(func(ctx context.Context) (err error) {
				for _, i := range c.Tags {
					if i == tag {
						return
					}
				}
				err = db.Delete(db.IndexCollectionTag.Key(tag, pk))
				return
			})
		}
		return nil
	})
	SignalSaved.Connect(func(ctx context.Context, c *Collection) error {
		pk, err := c.pk()
		if err != nil {
			return err
		}
		return db.Update(func(txn *db.Txn) error {
			for _, tag := range c.Tags {
				err = txn.Set(db.IndexCollectionTag.Key(tag, pk), nil)
				if err != nil {
					return err
				}
			}
			return nil
		})
	})
}
