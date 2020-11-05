package db

import "io"

// Backup calls underling db.Backup
func Backup(w io.Writer, since uint64) (uint64, error) {
	return db.Backup(w, since)
}
