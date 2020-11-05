package healthcheck

import (
	"errors"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/dgraph-io/badger/v2"
	"go.uber.org/zap"
)

// PresentationHashIndex check.
func PresentationHashIndex() (err error) {
	logger := logging.Logger("healthcheck").With(zap.String("func", "PresentationHashIndex"))
	logger.Info("start")
	err = db.Update(func(txn *db.Txn) (err error) {
		prefix := db.IndexPresentationHash.Prefix()
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
				var p = new(presentation.Presentation)
				err = txn.Get(db.IndexPresentation.Key(id), p)
				if errors.Is(err, db.ErrKeyNotFound) {
					logger.Info("unused")
					deletedCount++
					return txn.Delete(key)
				}
				if err != nil {
					return
				}

				var h1 = ""
				_, err = db.UnmarshalKey(key, &h1)
				if err != nil {
					return
				}
				h2, err := p.Hash()
				if err != nil {
					return
				}
				if h1 != h2 {
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
