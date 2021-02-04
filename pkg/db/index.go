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

// indexes used asa key prefix
const (
	// application metadata:
	//   "migateVersion" database current migration version
	IndexMetadata Index = iota
	IndexSequence
	// Priviously used by collected event model, which was removed at 2020-09-15
	_
	IndexCollection
	IndexCollectionOrigin
	IndexPresentation
	IndexPresentationHash
	IndexFile
	// to search presentation by path
	// key format: path, presentation pk
	// value: empty
	IndexPresentationFile
	// to search presentation that any file is outdated
	// key format: presentation pk
	// value: empty
	IndexPresentationOutdated
	// to store persisted query
	// https://gqlgen.com/reference/apq/
	// key: query sha256 hash
	// value: query
	IndexGraphQLPersistedQuery
	// key: tag, collection pk
	// value: empty
	IndexCollectionTag
)
