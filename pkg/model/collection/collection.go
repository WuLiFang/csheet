package collection

import (
	"encoding/base64"
	"errors"
	"time"

	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
)

// Collection belongs to a gallery.
type Collection struct {
	Origin          string
	Title           string
	Metadata        map[string]string
	Tags            []string
	CollectTime     time.Time
	PresentationIDs []string
	presentations   []presentation.Presentation
}

func (c Collection) key() ([]byte, error) {
	if c.Origin == "" {
		return nil, errors.New("missing collection origin")

	}
	var id, err = db.IndexCollectionOrigin.ValueID(c.Origin)
	return db.IndexCollection.Key(id), err
}

// Save to db.
func (c Collection) Save() error {
	key, err := c.key()
	if err != nil {
		return err
	}

	err = db.Update(func(txn *db.Txn) error {
		return txn.Set(key, c)
	})
	if err != nil {
		return err
	}
	SignalUpdated.Emit(c)
	return nil
}

// IsNode implements graphql Node interface.
func (Collection) IsNode() {}

// ID string for collection
func (c Collection) ID() string {
	key, err := c.key()
	if err != nil {
		logger.Errorw("invalid id", "error", err)
		return ""
	}
	return base64.RawStdEncoding.EncodeToString(key)
}

// Presentations related to this collection
func (c Collection) Presentations() ([]presentation.Presentation, error) {
	if c.presentations == nil {
		ret := make([]presentation.Presentation, 0, len(c.PresentationIDs))
		for _, i := range c.PresentationIDs {
			v, err := presentation.FindByID(i)
			if err == db.ErrKeyNotFound {
				logger.Warnw("presentation not found", "id", i)
				continue
			}
			if err != nil {
				return ret, err
			}
			ret = append(ret, v)
		}
		c.presentations = ret

	}
	return c.presentations, nil
}

// FindByID find id matched collection.
func FindByID(id string) (ret Collection, err error) {
	key, err := base64.RawURLEncoding.DecodeString(id)
	if err != nil {
		return
	}
	err = db.View(func(txn *db.Txn) error {
		return txn.Get(key, &ret)
	})
	return
}
