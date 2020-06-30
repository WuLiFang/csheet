package presentation

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strings"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
)

//go:generate gotmpl -o presentation_gen.go ../model.go.gotmpl
//go:generate gotmpl -o signal_gen.go  Type=*Presentation ../signal.go.gotmpl ../model_signals.gotmpl

// Presentation defines how to render collection
type Presentation struct {
	Type              Type
	Raw               string
	Thumb             string `bson:",omitempty"`
	ThumbSuccessTag   string `bson:",omitempty"`
	ThumbErrorTag     string `bson:",omitempty"`
	Regular           string `bson:",omitempty"`
	RegularSuccessTag string `bson:",omitempty"`
	RegularErrorTag   string `bson:",omitempty"`
}

func (p Presentation) hash() (ret string, err error) {
	if p.Type == "" {
		err = errors.New("missing presentation type")
		return
	}
	if p.Raw == "" {
		err = errors.New("missing presentation raw path")
		return
	}
	h := sha256.Sum256([]byte(strings.Join([]string{string(p.Type), p.Raw}, "\t")))
	ret = hex.EncodeToString(h[:])
	return
}

// Key in db.
func (p Presentation) Key() (ret []byte, err error) {
	h, err := p.hash()
	if err != nil {
		return
	}
	id, err := db.IndexPresentationHash.ValueID(h)
	return db.IndexPresentation.Key(id), err
}

func keyToID(key []byte) string {
	return base64.RawURLEncoding.EncodeToString(key)
}

func init() {
	SignalSaved.Connect(func(ctx context.Context, p *Presentation) error {
		key, err := p.Key()
		if err != nil {
			return err
		}
		return db.Update(func(txn *db.Txn) error {
			id := keyToID(key)
			err = txn.Set(db.IndexPresentationFile.Key(p.Raw, id), nil)
			if err != nil {
				return err
			}
			err = txn.Set(db.IndexPresentationFile.Key(p.Thumb, id), nil)
			if err != nil {
				return err
			}
			err = txn.Set(db.IndexPresentationFile.Key(p.Regular, id), nil)
			if err != nil {
				return err
			}
			err = txn.Set(db.IndexPresentationOutdated.Key(id), nil)
			if err != nil {
				return err
			}
			return nil
		})
	})
}

// FindByID find id matched presentation.
func FindByID(id string) (ret Presentation, err error) {
	key, err := base64.RawURLEncoding.DecodeString(id)
	if err != nil {
		return
	}
	err = db.View(func(txn *db.Txn) error {
		return txn.Get(key, &ret)
	})
	return
}

// Put a presentation to db, will validate raw file stat and unset error state.
func Put(t Type, path string) (ret Presentation, err error) {
	var logger = logging.Logger("model.presentation").Sugar()
	defer func() {
		logger.Debugw("put", "type", t, "path", path, "ret", ret, "error", err)
	}()
	f, err := file.FindOrCreateByPath(path)
	if err != nil {
		return
	}
	err = f.Stat()
	if err != nil {
		return
	}
	ret = Presentation{
		Type: t,
		Raw:  path,
	}
	err = ret.Load()
	if err == db.ErrKeyNotFound {
		err = nil
	}
	if err != nil {
		return
	}
	if ret.Raw != path || ret.Type != t {
		logger.Warnw("duplicated id detected, auto fix start", "id", ret.ID())
		ret = Presentation{
			Type: t,
			Raw:  path,
		}
		var h string
		h, err = ret.hash()
		if err != nil {
			return
		}
		_, err = db.IndexPresentationHash.NewValueID(h)
		if err != nil {
			return
		}
	}
	ret.ThumbErrorTag = ""
	ret.RegularErrorTag = ""
	err = ret.Save()
	return
}
