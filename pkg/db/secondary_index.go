package db

import (
	"fmt"
)

// IndexType is type of a index.
type IndexType uint64

// Index types
const (
	IndexTypeOther IndexType = iota
	IndexTypePrimary
	IndexTypeSecondaryOneToMany
	IndexTypeSecondaryOneToOne
)

// Type for index
func (i Index) Type() IndexType {
	switch i {
	case IndexCollection, IndexPresentation, IndexPresentationOutdated:
		return IndexTypePrimary
	case IndexCollectionOrigin, IndexPresentationHash:
		return IndexTypeSecondaryOneToOne
	case IndexPresentationFile, IndexCollectionTag:
		return IndexTypeSecondaryOneToMany
	}
	return IndexTypeOther
}

// PrimaryKey of given key base on index type
func (txn *Txn) PrimaryKey(
	key []byte,
) (ret string, err error) {
	index, err := UnmarshalKey(key)
	if err != nil {
		return
	}
	switch index.Type() {
	case IndexTypeOther:
		err = fmt.Errorf("PrimaryKey: no primary key for index: %d", index)
	case IndexTypePrimary:
		_, err = UnmarshalKey(key, &ret)
	case IndexTypeSecondaryOneToOne:
		item, getErr := txn.Txn.Get(key)
		err = getErr
		if err != nil {
			return
		}
		var data []byte
		data, err = item.ValueCopy(nil)
		if err != nil {
			return
		}
		ret = string(data)
	case IndexTypeSecondaryOneToMany:
		_, err = UnmarshalKey(key, nil, &ret)
	}

	return
}
