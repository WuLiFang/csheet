// Code generated from [../../model.go.gotmpl], DO NOT EDIT.

package collected

import (
	"context"
	"encoding/base64"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"go.uber.org/zap"
)

// IsNode implements graphql Node interface.
func (Event) IsNode() {}


// ID string for Event, empty string when error.
func (o Event) ID() string {
	key, err := o.Key()
	if err != nil {
		logging.Logger("model").Error("invalid id", zap.Error(err))
		return ""
	}
	return base64.RawURLEncoding.EncodeToString(key)
}


// Save Event to db.
func (o *Event) Save() (err error) {
	var ctx = context.TODO()
	err = SignalWillSave.Emit(ctx, o)
	if err != nil {
		return
	}
	var key []byte
	key, err = o.Key()
	if err != nil {
		return
	}
	return db.Update(func(txn *db.Txn) (err error) {
		err = txn.Set(key, o)
		if err != nil {
			return
		}
		err = SignalSaved.Emit(ctx, o)
		return
	})
}

// Load Event from db.
func (o *Event) Load() (err error) {
	var ctx = context.TODO()
	err = SignalWillLoad.Emit(ctx, o)
	if err != nil {
		return
	}
	key, err := o.Key()
	if err != nil {
		return
	}
	var v = new(Event)
	err = db.Get(key, v)
	if err != nil {
		return
	}
	*o = *v
	err = SignalLoaded.Emit(ctx, o)
	return
}

// Delete Event from db.
func (o *Event) Delete() (err error) {
	var ctx = context.TODO()
	err = SignalWillDelete.Emit(ctx, o)
	if err != nil {
		return
	}
	var key []byte
	key, err = o.Key()
	if err != nil {
		return
	}
	return db.Update(func(txn *db.Txn) (err error) {
		err = txn.Delete(key)
		if err != nil {
			return
		}
		err = SignalDeleted.Emit(ctx, o)
		return
	})
}
