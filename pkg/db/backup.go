package db

import (
	"io"
	"runtime"

	"github.com/WuLiFang/csheet/v6/pkg/db/migrations"
)

// Backup calls underling db.Backup
func Backup(w io.Writer, since uint64) (uint64, error) {
	err := db.Flatten(runtime.NumCPU())
	if err != nil {
		return 0, err
	}
	return db.Backup(w, since)
}

// Restore database from reader and apply migrations.
func Restore(r io.Reader, maxPendingWrites int, skipDrop bool) (err error) {
	if !skipDrop {
		err = db.DropAll()
		if err != nil {
			return err
		}
	}
	err = db.Load(r, maxPendingWrites)
	if err != nil {
		return
	}

	err = migrations.Migrate(db)
	if err != nil {
		return
	}

	return
}
