package presentation

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/models/file"
	"github.com/WuLiFang/csheet/v6/pkg/transcode"
	"go.uber.org/zap"
)

//go:generate gotmpl -o presentation_gen.go ../model.go.gotmpl
//go:generate gotmpl -o signal_gen.go  Type=*Presentation ../signal.go.gotmpl ../model_signals.gotmpl

// Presentation defines how to render collection
type Presentation struct {
	Type              Type
	Raw               string
	Thumb             string            `bson:",omitempty"`
	ThumbSuccessTag   string            `bson:",omitempty"`
	ThumbErrorTag     string            `bson:",omitempty"`
	Regular           string            `bson:",omitempty"`
	RegularSuccessTag string            `bson:",omitempty"`
	RegularErrorTag   string            `bson:",omitempty"`
	Metadata          map[string]string `bson:",omitempty"`
}

// Hash from type and raw file path.
func (p Presentation) Hash() (ret string, err error) {
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

// Validate and clean up data
func (p *Presentation) Validate(ctx context.Context) (err error) {
	return
}

// SetMetadata pair, use empty value to delete pair.
func (p *Presentation) SetMetadata(k, v string) (changed bool) {
	if v == "" {
		delete(p.Metadata, k)
		if len(p.Metadata) == 0 {
			p.Metadata = nil
		}
		return
	}
	if p.Metadata == nil {
		p.Metadata = make(map[string]string)
	}
	if p.Metadata[k] == v {
		return
	}
	p.Metadata[k] = v
	changed = true
	return
}

// RawTag return tag of raw file, empty before file stat or file deleted from db.
func (p Presentation) RawTag() string {
	raw, err := file.FindByPath(p.Raw)
	if errors.Is(err, db.ErrKeyNotFound) {
		return ""
	}
	if err != nil {
		logging.Logger("model.presentation").DPanic("load raw file failed", zap.Error(err))
	}
	return raw.Tag()
}

func (p Presentation) pk() (ret string, err error) {
	h, err := p.Hash()
	if err != nil {
		return
	}
	return db.IndexPresentationHash.ValueID(h)
}

// PrimaryKey for presentation, base64 encoded number by hash.
func (p Presentation) PrimaryKey() string {
	pk, err := p.pk()
	if err != nil {
		logging.Logger("model.presentation").DPanic("get pk failed", zap.Error(err))
	}
	return pk
}

// Key in db.
func (p Presentation) Key() (ret []byte, err error) {
	pk, err := p.pk()
	return db.IndexPresentation.Key(pk), err
}

func keyToID(key []byte) string {
	return base64.RawURLEncoding.EncodeToString(key)
}

func init() {
	SignalSaved.Connect(func(ctx context.Context, p *Presentation) error {
		pk, err := p.pk()
		if err != nil {
			return err
		}
		return db.Update(func(txn *db.Txn) error {
			err = txn.Set(db.IndexPresentationFile.Key(p.Raw, pk), nil)
			if err != nil {
				return err
			}
			err = txn.Set(db.IndexPresentationFile.Key(p.Thumb, pk), nil)
			if err != nil {
				return err
			}
			err = txn.Set(db.IndexPresentationFile.Key(p.Regular, pk), nil)
			if err != nil {
				return err
			}
			err = txn.Set(db.IndexPresentationOutdated.Key(pk), nil)
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

// Probe update metadata by raw file media info
func (p *Presentation) Probe() (changed bool, err error) {
	info, err := transcode.Probe(p.Raw)
	if err != nil {
		err = fmt.Errorf("presentation: Probe: %w", err)
		return
	}
	switch p.Type {
	case TypeVideo:
		changed = p.SetMetadata("duration", strconv.FormatFloat(info.Duration().Seconds(), 'f', -1, 64)) || changed
		changed = p.SetMetadata("frame-count", strconv.FormatInt(info.FrameCount(), 10)) || changed
		changed = p.SetMetadata("frame-rate", info.FrameRate()) || changed
		fallthrough
	case TypeImage:
		changed = p.SetMetadata("width", strconv.FormatInt(info.Width(), 10)) || changed
		changed = p.SetMetadata("height", strconv.FormatInt(info.Height(), 10)) || changed
		changed = p.SetMetadata("pixel-format", info.PixelFormat()) || changed
	}
	return
}

// ProbeAndSave if metadata changed
func (p *Presentation) ProbeAndSave(ctx context.Context) (err error) {
	changed, err := p.Probe()
	if err != nil {
		return
	}
	if changed {
		err = p.Save(ctx)
		return
	}
	return
}

// Put a presentation to db, will validate raw file stat and unset error state.
func Put(ctx context.Context, t Type, path string) (ret Presentation, err error) {
	var logger = logging.Logger("model.presentation").Sugar()
	defer func() {
		logger.Debugw("put", "type", t, "path", path, "ret", ret, "error", err)
	}()
	f, err := file.FindOrCreateByPath(ctx, path)
	if err != nil {
		return
	}
	err = f.Stat(ctx)
	if err != nil {
		return
	}
	ret = Presentation{
		Type: t,
		Raw:  path,
	}
	err = ret.Load(ctx)
	if err == db.ErrKeyNotFound {
		err = nil
	}
	if err != nil {
		return
	}
	ret.ThumbErrorTag = ""
	ret.RegularErrorTag = ""
	err = ret.Save(ctx)
	return
}
