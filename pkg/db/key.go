package db

import (
	"bytes"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"io"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
)

// KeyPartsDelimiter used to join key parts.
const KeyPartsDelimiter byte = '\t'

func marshalKeyParts(parts ...string) ([]byte, error) {
	b := new(bytes.Buffer)
	for index, i := range parts {
		data := []byte(i)
		if bytes.IndexByte(data, KeyPartsDelimiter) >= 0 {
			return b.Bytes(), errors.New("key parts can not contains \t")
		}
		_, err := b.Write(data)
		if err != nil {
			return b.Bytes(), err
		}
		if index < len(parts)-1 {
			err = b.WriteByte(KeyPartsDelimiter)
			if err != nil {
				return b.Bytes(), err
			}
		}
	}
	return b.Bytes(), nil
}

func unmarshalKeyParts(data []byte, parts ...*string) error {
	b := bytes.NewBuffer(data)
	for _, i := range parts {
		d, err := b.ReadBytes(KeyPartsDelimiter)
		if err == io.EOF {
			err = nil
		} else if err != nil {
			return err
		} else {
			// remove delimiter
			d = d[:len(d)-1]
		}
		if i != nil {
			*i = string(d)
		}
	}
	return nil
}

// Key build db key from parts.
// index must be registered index name, will be converted to 2 bytes.
// follow parts joined by keySeperator.
func (index Index) Key(parts ...string) []byte {
	if len(parts) == 0 {
		return index.Bytes()
	}
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
	var idData = make([]byte, 8)
	binary.BigEndian.PutUint64(idData, seqV)
	for len(idData) > 1 && idData[0] == 0x00 {
		idData = idData[1:]
	}
	id = base64.RawURLEncoding.EncodeToString(idData)
	err = SetBytes(key, []byte(id))
	return
}

// ValueID find or create id for value on given index.
func (index Index) ValueID(value string) (id string, err error) {
	key := index.Key(value)
	data, err := GetBytes(key)
	if err == ErrKeyNotFound {
		return index.NewValueID(value)
	}
	id = string(data)
	return
}
