package db

import (
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/db/migrations"
	"github.com/dgraph-io/badger/v2"
	"github.com/dgraph-io/badger/v2/options"
	"go.uber.org/zap"
)

var db *badger.DB

type zapLoggerAdapter struct {
	l *zap.SugaredLogger
}

func (a zapLoggerAdapter) Errorf(template string, args ...interface{}) {
	a.l.Errorf(template, args...)
}

func (a zapLoggerAdapter) Warningf(template string, args ...interface{}) {
	a.l.Warnf(template, args...)
}

func (a zapLoggerAdapter) Infof(template string, args ...interface{}) {
	a.l.Infof(template, args...)
}

func (a zapLoggerAdapter) Debugf(template string, args ...interface{}) {
	a.l.Debugf(template, args)
}

// Open database at given path
func Open(path string) (err error) {
	db, err = badger.Open(
		badger.
			DefaultOptions(path).
			WithValueLogLoadingMode(options.FileIO).
			WithTableLoadingMode(options.FileIO).
			WithNumCompactors(1).
			WithNumLevelZeroTables(1).
			WithNumMemtables(1).
			WithSyncWrites(false).
			WithKeepL0InMemory(false).
			WithTruncate(true).
			WithLogger(zapLoggerAdapter{logging.Logger("db").Sugar()}),
	)
	if err != nil {
		return
	}
	err = migrations.Migrate(db)
	return
}

// OpenInMemory open database in memory
func OpenInMemory() (err error) {
	db, err = badger.Open(
		badger.
			DefaultOptions("").
			WithInMemory(true),
	)
	return err
}

// RunGC for database.
func RunGC() error {
	err := db.RunValueLogGC(0.7)
	if err == nil {
		return RunGC()
	}
	return err
}

// EnableGC run garbage collection in given interval.
// Should only call once.
func EnableGC(interval time.Duration) {
	go func() {
		ticker := time.NewTicker(interval)
		for range ticker.C {
			RunGC()
		}
	}()
}

// Close database
func Close() error {
	err := ReleaseSequences()
	if err != nil {
		logging.Logger("db").
			Error("release sequence failed",
				zap.Error(err),
			)
	}
	return db.Close()
}
