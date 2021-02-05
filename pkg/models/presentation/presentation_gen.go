// Code generated from [../model.go.gotmpl], DO NOT EDIT.

package presentation

import (
	"context"
	"encoding/base64"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"go.uber.org/zap"
)

// IsNode implements graphql Node interface.
func (Presentation) IsNode() {}


// ID string for Presentation, empty string when error.
func (o Presentation) ID() string {
	key, err := o.Key()
	if err != nil {
		logging.Logger("model").Error("invalid id", zap.Error(err))
		return ""
	}
	return base64.RawURLEncoding.EncodeToString(key)
}


// Save Presentation to db.
func (o *Presentation) Save(ctx context.Context) (err error) {
	err = o.Validate(ctx)
	if err != nil {
		return
	}
	select {
		case <- ctx.Done():
			return ctx.Err()
		default:
	}
	err = SignalWillSave.Emit(ctx, o)
	if err != nil {
		return
	}
	var key []byte
	key, err = o.Key()
	if err != nil {
		return
	}
	err = db.Update(func(txn *db.Txn) (err error) {
		return txn.Set(key, o)
	})
	if err != nil {
		return
	}
	err = SignalSaved.Emit(ctx, o)
	return
}

// Load Presentation from db.
func (o *Presentation) Load(ctx context.Context) (err error) {
	select {
		case <- ctx.Done():
			return ctx.Err()
		default:
	}
	err = SignalWillLoad.Emit(ctx, o)
	if err != nil {
		return
	}
	key, err := o.Key()
	if err != nil {
		return
	}
	var v = new(Presentation)
	err = db.Get(key, v)
	if err != nil {
		return
	}
	*o = *v
	err = SignalLoaded.Emit(ctx, o)
	return
}

// Delete Presentation from db.
func (o *Presentation) Delete(ctx context.Context) (err error) {
	select {
		case <- ctx.Done():
			return ctx.Err()
		default:
	}
	err = SignalWillDelete.Emit(ctx, o)
	if err != nil {
		return
	}
	var key []byte
	key, err = o.Key()
	if err != nil {
		return
	}
	err = db.Update(func(txn *db.Txn) (err error) {
		return txn.Delete(key)
	})
	if err != nil {
		return
	}
	err = SignalDeleted.Emit(ctx, o)
	return
}
