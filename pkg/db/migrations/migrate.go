package migrations

import (
	"encoding/binary"
	"errors"
	"fmt"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/dgraph-io/badger/v2"
	"go.uber.org/zap"
)

type migration struct {
	Version     uint64
	Description string
	Migrate     func(*badger.DB) error
}

var migrations []migration

func addMigration(m migration) {
	if len(migrations) > 0 {
		var last = migrations[len(migrations)-1].Version
		if last+1 != m.Version {
			panic(fmt.Errorf("addMigration: next version should be %d, got %d", last+1, m.Version))
		}
	}
	migrations = append(migrations, m)
}

var migrationVersionKey = []byte("\x00\x00migration-version")

func version(db *badger.DB) (ret uint64, err error) {
	err = db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(migrationVersionKey)
		if err != nil {
			return err
		}
		return item.Value(func(v []byte) error {
			ret = binary.BigEndian.Uint64(v)
			return nil
		})
	})
	return
}

func setVersion(db *badger.DB, v uint64) (err error) {
	return db.Update(func(txn *badger.Txn) error {
		var data = make([]byte, 8)
		binary.BigEndian.PutUint64(data, v)
		return txn.Set(migrationVersionKey, data)
	})
}

func isEmptyDatabase(db *badger.DB) (ret bool, err error) {
	err = db.View(func(txn *badger.Txn) error {
		it := txn.NewIterator(badger.IteratorOptions{})
		defer it.Close()
		it.Seek([]byte{})
		ret = !it.Valid()
		return nil
	})
	return
}

func fixVersionKey(db *badger.DB) error {
	return db.Update(func(txn *badger.Txn) error {
		return ignoreKeyNotFound(renameEntry(txn, []byte(`\x00\x00migrationVersion`), migrationVersionKey))
	})
}

// Migrate database to latest.
func Migrate(db *badger.DB) (err error) {
	var logger = logging.Logger("db.migrations")

	// Fix wrong migration key before version 3
	err = fixVersionKey(db)
	if err != nil {
		return
	}

	var latestVersion = migrations[len(migrations)-1].Version
	currentVersion, err := version(db)
	if errors.Is(err, badger.ErrKeyNotFound) {
		var ok bool
		ok, err = isEmptyDatabase(db)
		if err != nil {
			return
		}
		if ok {
			// fresh install, we can skip migration.
			return setVersion(db, latestVersion)
		}
	}

	// v1 migration has bug, we need rerun.
	if currentVersion == 1 {
		currentVersion = 0
	}

	if currentVersion == latestVersion {
		logger.Info(
			"no migration required",
			zap.Uint64("currentVersion", currentVersion),
		)
		return
	}

	if err != nil {
		return
	}
	for _, m := range migrations {
		if m.Version <= currentVersion {
			continue
		}
		logger.Info("migrate", zap.Uint64("version", m.Version), zap.String("description", m.Description))
		err = m.Migrate(db)
		if err != nil {
			return
		}
		err = setVersion(db, m.Version)
		if err != nil {
			return
		}
	}

	logger.Info("migrated",
		zap.Uint64("from", currentVersion),
		zap.Uint64("to", latestVersion),
	)
	return

}
