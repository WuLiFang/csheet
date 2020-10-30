package db

import (
	"bytes"
	"encoding/binary"
	"errors"
	"strconv"
	"strings"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
)

// KeyPartsDelimiter used to join key parts.
const KeyPartsDelimiter = '\t'

func marshalKeyParts(parts ...string) ([]byte, error) {
	b := bytes.NewBuffer([]byte{})
	for _, i := range parts {
		if strings.Contains(i, string(KeyPartsDelimiter)) {
			return b.Bytes(), errors.New("key parts can not contains \t")
		}
		_, err := b.Write([]byte(i))
		if err != nil {
			return b.Bytes(), err
		}
		_, err = b.Write([]byte{KeyPartsDelimiter})
		if err != nil {
			return b.Bytes(), err
		}
	}
	return b.Bytes(), nil
}

func unmarshalKeyParts(data []byte, parts ...*string) error {
	b := bytes.NewBuffer(data)
	for _, i := range parts {
		d, err := b.ReadBytes(KeyPartsDelimiter)
		if err != nil {
			return err
		}
		if i != nil {
			*i = string(d[:len(d)-1])
		}
	}
	return nil
}

// Key build db key from parts.
// index must be registered index name, will be converted to 2 bytes.
// follow parts joined by keySeperator.
func (index Index) Key(parts ...string) []byte {
	data, err := marshalKeyParts(parts...)
	if err != nil {
		logging.Logger("db").Sugar().
			Panicw("key encoding error",
				"error", err,
				"index", index,
				"parts", parts)
	}
	return append(index.Bytes(), data...)
}

// Exists check if any related data exists.
func (index Index) Exists() (ret bool, err error) {
	err = View(func(txn *Txn) error {
		opt := DefaultIteratorOptions
		opt.PrefetchValues = false
		it := txn.NewIterator(opt)
		defer it.Close()
		prefix := index.Bytes()
		it.Seek(prefix)
		ret = it.ValidForPrefix(prefix)
		return nil
	})
	return
}

// Prefix key for index scan.
func (index Index) Prefix(parts ...string) (ret []byte) {
	if len(parts) == 0 {
		return index.Bytes()
	}
	ret = index.Key(parts...)
	return ret[:len(ret)-1]
}

// UnmarshalKey to index and parts.
func UnmarshalKey(v []byte, parts ...*string) (index Index, err error) {
	if len(v) <= 3 {
		err = errors.New("invalid key")
		return
	}
	index = Index(binary.BigEndian.Uint16(v[:2]))
	err = unmarshalKeyParts(v[2:], parts...)
	return
}

// NewValueID get interger id for value from sequence.
func (index Index) NewValueID(value string) (id string, err error) {
	key := index.Key(value)
	seq, err := index.Sequence()
	if err != nil {
		return
	}
	seqV, err := seq.Next()
	if err != nil {
		return
	}
	id = strconv.FormatUint(seqV, 10)
	err = Set(key, id)
	return
}

// ValueID find or create id for value on given index.
func (index Index) ValueID(value string) (id string, err error) {
	key := index.Key(value)
	err = Get(key, &id)
	if err == ErrKeyNotFound {
		return index.NewValueID(value)
	}
	return
}
