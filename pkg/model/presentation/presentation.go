package presentation

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
)

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

func (p Presentation) key() (ret []byte, err error) {
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

// ID of object.
func (p Presentation) ID() string {
	key, err := p.key()
	if err != nil {
		logger.Errorw("invalid id", "error", err)
		return ""
	}
	return base64.RawURLEncoding.EncodeToString(key)
}

// IsNode implements graphql Node interface.
func (Presentation) IsNode() {}

// Save to db.
func (p Presentation) Save() error {
	key, err := p.key()
	if err != nil {
		return err
	}
	err = db.Update(func(txn *db.Txn) error {
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
		return txn.Set(key, p)
	})
	if err != nil {
		return err
	}
	SignalUpdated.Emit(p)
	return nil
}

// Load from db.
func (p *Presentation) Load() error {
	key, err := p.key()
	if err != nil {
		return err
	}
	err = db.Get(key, p)
	if err != nil {
		return err
	}
	return err
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
