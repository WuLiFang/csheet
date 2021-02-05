package healthcheck

import (
	"errors"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
	"github.com/dgraph-io/badger/v2"
	"go.uber.org/zap"
)

// CollectionTagIndex check.
func CollectionTagIndex() (err error) {
	logger := logging.Logger("healthcheck").With(zap.String("func", "CollectionTagIndex"))
	logger.Info("start")
	err = db.View(func(txn *db.Txn) (err error) {
		prefix := db.IndexCollectionTag.Key()
		cur := txn.NewIterator(badger.IteratorOptions{
			Prefix: prefix,
		})
		defer cur.Close()
		checkedCount := 0
		deletedCount := 0
		for cur.Seek(prefix); cur.ValidForPrefix(prefix); cur.Next() {
			checkedCount++
			i := cur.Item()
			key := i.Key()
			logger := logger.With(zap.Binary("k", key))
			logger.Debug("read")
			var id = ""
			var tag = ""
			_, err = db.UnmarshalKey(key, &tag, &id)
			if err != nil {
				return
			}
			var col = new(collection.Collection)
			err = func() (err error) {
				err = txn.Get(db.IndexCollection.Key(id), col)
				if errors.Is(err, db.ErrKeyNotFound) {
					logger.Info("unused")
					deletedCount++
					return db.Delete(key)
				}
				if err != nil {
					return
				}

				var tagSet = stringSet(col.Tags)
				if _, ok := tagSet[tag]; !ok {
					logger.Debug("outdated")
					deletedCount++
					return db.Delete(key)
				}
				return
			}()
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
