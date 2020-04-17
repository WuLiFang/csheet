package db

import (
	"bytes"
	"encoding/binary"
	"errors"
	"strconv"
	"strings"

	"github.com/dgraph-io/badger/v2"
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
		*i = string(d[:len(d)-1])
	}
	return nil
}

// Key build db key from parts.
// index must be registered index name, will be converted to 2 bytes.
// follow parts joined by keySeperator.
func (index Index) Key(parts ...string) []byte {
	data, err := marshalKeyParts(parts...)
	if err != nil {
		logger.Panicw("key encoding error",
			"error", err,
			"index", index,
			"parts", parts)
	}
	return append(index.Bytes(), data...)
}

// Prefix key for index scan.
func (index Index) Prefix(parts ...string) (ret []byte) {
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

// Sequence get integer sequence for a index.
func (index Index) Sequence(bandwidth uint64) (*badger.Sequence, error) {
	return db.GetSequence(IndexSequence.Key(string(index.Bytes())), bandwidth)
}

// ValueID find or create id for value on given index.
func (index Index) ValueID(value string) (id string, err error) {
	err = Update(func(txn *Txn) error {
		key := index.Key(value)
		err := txn.Get(key, &id)
		if err == ErrKeyNotFound {
			seq, err := index.Sequence(1)
			defer seq.Release()
			if err != nil {
				return err
			}
			seqV, err := seq.Next()
			if err != nil {
				return err
			}
			id = strconv.FormatUint(seqV, 10)
			return txn.Set(key, id)
		}
		return err
	})
	return
}
