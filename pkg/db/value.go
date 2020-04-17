package db

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/bsonrw"
	"go.mongodb.org/mongo-driver/bson/bsontype"
)

// ValueMarshaler is an interface implemented by types that can marshal
// themselves into a db value as bytes.
type ValueMarshaler interface {
	MarshalDBValue() ([]byte, error)
}

// MarshalValue encode struct to bytes.
func MarshalValue(v interface{}) (ret []byte, err error) {
	if v == nil {
		return
	}
	if v, ok := v.(ValueMarshaler); ok {
		return v.MarshalDBValue()
	}
	t, data, err := bson.MarshalValue(v)
	ret = append(ret, byte(t))
	ret = append(ret, data...)
	return
}

// ValueUnmarshaler is an interface implemented by types that can unmarshal a
// db value representaiton of themselves.
type ValueUnmarshaler interface {
	UnmarshalDBValue([]byte) error
}

// UnmarshalValue decode bytes to struct.
func UnmarshalValue(data []byte, v interface{}) error {
	if v, ok := v.(ValueUnmarshaler); ok {
		return v.UnmarshalDBValue(data)
	}
	vr := bsonrw.NewBSONValueReader(bsontype.Type(data[0]), data[1:])
	dec, err := bson.NewDecoder(vr)
	if err != nil {
		return err
	}
	return dec.Decode(v)
}
