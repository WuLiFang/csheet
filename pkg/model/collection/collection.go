package collection

import (
	"encoding/base64"
	"errors"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"go.uber.org/zap"
)

//go:generate gotmpl -o collection_gen.go ../model.go.gotmpl
//go:generate gotmpl -o signal_gen.go  Type=*Collection ../signal.go.gotmpl ../model_signals.gotmpl

// Collection belongs to a gallery.
type Collection struct {
	Origin          string
	Title           string
	Metadata        map[string]string
	CollectTime     time.Time
	PresentationIDs []string
	presentations   []presentation.Presentation
}

// Key for db
func (c Collection) Key() ([]byte, error) {
	if c.Origin == "" {
		return nil, errors.New("missing collection origin")
	}
	var id, err = db.IndexCollectionOrigin.ValueID(c.Origin)
	return db.IndexCollection.Key(id), err
}

// Presentations related to this collection
func (c Collection) Presentations() ([]presentation.Presentation, error) {
	var logger = logging.Logger("model.collection")
	if c.presentations == nil {
		ret := make([]presentation.Presentation, 0, len(c.PresentationIDs))
		for _, i := range c.PresentationIDs {
			v, err := presentation.FindByID(i)
			if err == db.ErrKeyNotFound {
				logger.Warn("presentation not found", zap.String("id", i))
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
