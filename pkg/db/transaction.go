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

// Delete single key value pair from db.
func Delete(key []byte) error {
	return Update(
		func(txn *Txn) error {
			return txn.Delete(key)
		},
	)
}

// Get single key value pair.
func Get(key []byte, value interface{}) (err error) {
	return View(
		func(txn *Txn) error {
			return txn.Get(key, value)
		},
	)
}

// GetBytes without decoding.
func GetBytes(key []byte) (ret []byte, err error) {
	err = View(
		func(txn *Txn) (err error) {
			item, err := txn.Txn.Get(key)
			if err != nil {
				return err
			}
			ret, err = item.ValueCopy(nil)
			return
		},
	)
	return
}

// Set single key value pair.
func Set(key []byte, value interface{}) (err error) {
	return Update(
		func(txn *Txn) error {
			return txn.Set(key, value)
		},
	)
}

// SetBytes without decoding.
func SetBytes(key []byte, value []byte) (err error) {
	err = Update(
		func(txn *Txn) error {
			return txn.Txn.Set(key, value)
		},
	)
	return
}
