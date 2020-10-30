package api

import (
	"context"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/dgraph-io/badger/v2"
	"go.uber.org/zap"
)

// QueryCache for persisted query
type QueryCache struct {
	TTL time.Duration
}

// Get looks up a key's value from the cache.
func (c QueryCache) Get(ctx context.Context, key string) (value interface{}, ok bool) {
	err := db.Get(db.IndexGraphQLPersistedQuery.Key(key), &value)
	if err == db.ErrKeyNotFound {
		ok = false
		return
	}
	if err != nil {
		logging.Logger("api.cache").DPanic("get cache failed", zap.Error(err))
		return
	}
	ok = true
	c.Add(ctx, key, value) // refresh ttl
	return
}

// Add adds a value to the cache.
func (c QueryCache) Add(ctx context.Context, key string, value interface{}) {
	err := db.Update(func(txn *db.Txn) error {
		v, err := db.MarshalValue(value)
		if err != nil {
			return err
		}
		var entry = badger.NewEntry(
			db.IndexGraphQLPersistedQuery.Key(key),
			v,
		).WithTTL(c.TTL)
		return txn.SetEntry(entry)
	})
	if err != nil {
		logging.Logger("api.cache").DPanic("get cache failed", zap.Error(err))
	}
}
