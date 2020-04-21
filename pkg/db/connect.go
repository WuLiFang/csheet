package db

import (
	"time"

	"github.com/dgraph-io/badger/v2"
	"github.com/dgraph-io/badger/v2/options"
)

var db *badger.DB

// Open database at given path
func Open(path string) (err error) {
	db, err = badger.Open(
		badger.
			DefaultOptions(path).
			WithValueLogLoadingMode(options.FileIO).
			WithTableLoadingMode(options.FileIO).
			WithTruncate(true),
	)

	return err
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
		logger.Errorw("release sequence failed", "error", err)
	}
	return db.Close()
}
