package db

import "encoding/binary"

// Index is encoded key prefix.
type Index uint16

// Bytes for this index.
func (i Index) Bytes() []byte {
	ret := make([]byte, 2)
	binary.BigEndian.PutUint16(ret, uint16(i))
	return ret
}

const (
	// IndexMigrations used as key prefix.
	IndexMigrations Index = iota
	// IndexSequence used as key prefix.
	IndexSequence
	// IndexCollectedEvent used ad key prefix.
	IndexCollectedEvent
	// IndexCollection used as key prefix.
	IndexCollection
	// IndexCollectionOrigin used as key prefix.
	IndexCollectionOrigin
	// IndexPresentation used as key prefix.
	IndexPresentation
	// IndexPresentationHash used as key prefix.
	IndexPresentationHash
	// IndexFile used as key prefix.
	IndexFile
	// IndexPresentationRaw is a secondary index
	// to search presentation by raw path
	// key format: raw path, presentation id
	// value: empty
	IndexPresentationRaw
)
