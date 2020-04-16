package db

import "github.com/dgraph-io/badger/v2"

// ErrKeyNotFound is returned when key isn't found on a txn.Get.
var ErrKeyNotFound = badger.ErrKeyNotFound

// DefaultIteratorOptions contains default options when iterating over Badger key-value stores.
var DefaultIteratorOptions = badger.DefaultIteratorOptions
