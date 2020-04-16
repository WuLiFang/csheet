package presentation

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strings"

	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/WuLiFang/csheet/pkg/model/file"
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

func (p Presentation) key() (ret []byte, err error) {
	if p.Type == "" {
		err = errors.New("missing presentation type")
		return
	}
	if p.Raw == "" {
		err = errors.New("missing presentation raw path")
		return
	}
	h := sha256.Sum256([]byte(strings.Join([]string{string(p.Type), p.Raw}, "\t")))
	id, err := db.IndexPresentationHash.ValueID(hex.EncodeToString(h[:]))
	return db.IndexPresentation.Key(id), err
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
	return db.View(func(txn *db.Txn) error {
		return txn.Get(key, p)
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

// Scan all saved presentation.
func Scan(fn func(v Presentation) bool) error {
	return db.View(func(txn *db.Txn) error {
		cur := txn.NewIterator(db.DefaultIteratorOptions)
		defer cur.Close()
		prefix := db.IndexPresentation.Bytes()
		for cur.Seek(prefix); cur.ValidForPrefix(prefix); cur.Next() {
			var v Presentation
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

// FindOrCreate a matched presentation
func FindOrCreate(t Type, path string) (ret Presentation, err error) {
	ret = Presentation{
		Type: t,
		Raw:  path,
	}
	_, err = file.FindOrCreateByPath(ret.Raw)
	if err != nil {
		return
	}
	err = ret.Load()
	if err == db.ErrKeyNotFound {
		err = ret.Save()
	}
	return
}
