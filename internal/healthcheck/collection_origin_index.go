package healthcheck

import (
	"errors"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/dgraph-io/badger/v2"
	"go.uber.org/zap"
)

// CollectionOriginIndex check.
func CollectionOriginIndex() (err error) {
	logger := logging.Logger("healthcheck").With(zap.String("func", "CollectionOriginIndex"))
	logger.Info("start")
	err = db.Update(func(txn *db.Txn) (err error) {
		prefix := db.IndexCollectionOrigin.Prefix()
		cur := txn.NewIterator(badger.IteratorOptions{
			Prefix: prefix,
		})
		defer cur.Close()
		checkedCount := 0
		deletedCount := 0
		for cur.Seek(prefix); cur.ValidForPrefix(prefix); cur.Next() {
			i := cur.Item()

			key := i.Key()
			err = i.Value(func(v []byte) (err error) {
				logger := logger.With(zap.Binary("k", key), zap.Binary("v", v))
				logger.Debug("read")
				id := string(v)
				if err != nil {
					return
				}
				var col = new(collection.Collection)
				err = txn.Get(db.IndexCollection.Key(id), col)
				if errors.Is(err, db.ErrKeyNotFound) {
					logger.Info("unused")
					deletedCount++
					return txn.Delete(key)
				}
				if err != nil {
					return
				}

				var origin = ""
				_, err = db.UnmarshalKey(key, &origin)
				if err != nil {
					return
				}
				if origin != col.Origin {
					logger.Info("wrong")
					deletedCount++
					return txn.Delete(key)
				}
				return
			})
			if err != nil {
				return
			}
			checkedCount++
		}
		logger.Info("done", zap.Int("checkedCount", checkedCount), zap.Int("deletedCount", deletedCount))
		return
	})

	if err != nil {
		logger.Error("failed", zap.Error(err))
	}
	return
}
