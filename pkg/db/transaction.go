package db

import "github.com/dgraph-io/badger/v2"

// Txn wraps badger.Txn
type Txn struct {
	*badger.Txn
}

// Set any value with custom encoding.
func (txn *Txn) Set(key []byte, value interface{}) (err error) {
	v, err := MarshalValue(value)
	if err != nil {
		return
	}
	err = txn.Txn.Set(key, v)
	return
}

// Get any value with custom encoding.
func (txn *Txn) Get(key []byte, value interface{}) (err error) {
	item, err := txn.Txn.Get(key)
	if err != nil {
		return
	}
	return item.Value(func(v []byte) error {
		return UnmarshalValue(v, value)
	})
}

// View wraps badger's db view method.
func View(fn func(txn *Txn) error) error {
	return db.View(
		func(txn *badger.Txn) error {
			return fn(&Txn{txn})
		},
	)
}

// Update wraps badger's db update method.
func Update(fn func(txn *Txn) error) error {
	return db.Update(
		func(txn *badger.Txn) error {
			return fn(&Txn{txn})
		},
	)
}
