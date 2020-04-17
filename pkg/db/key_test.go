package db

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPartsEncoding(t *testing.T) {
	t.Run("single",
		func(t *testing.T) {
			data, err := marshalKeyParts("test")
			require.NoError(t, err)
			assert.Equal(t, []byte{0x74, 0x65, 0x73, 0x74, 0x09}, data)
			var v string
			err = unmarshalKeyParts(data, &v)
			require.NoError(t, err)
			assert.Equal(t, "test", v)

		})
	t.Run("multiple",
		func(t *testing.T) {
			data, err := marshalKeyParts("foo", "bar")
			require.NoError(t, err)
			assert.Equal(t, []byte{0x66, 0x6f, 0x6f, 0x09, 0x62, 0x61, 0x72, 0x09}, data)
			var v1, v2 string
			err = unmarshalKeyParts(data, &v1, &v2)
			require.NoError(t, err)
			assert.Equal(t, "foo", v1)
			assert.Equal(t, "bar", v2)
		})
	t.Run("nil",
		func(t *testing.T) {
			data, err := marshalKeyParts("foo", "bar")
			require.NoError(t, err)
			assert.Equal(t, []byte{0x66, 0x6f, 0x6f, 0x09, 0x62, 0x61, 0x72, 0x09}, data)
			var v2 string
			err = unmarshalKeyParts(data, nil, &v2)
			require.NoError(t, err)
			assert.Equal(t, "bar", v2)
		})
	t.Run("invalid",
		func(t *testing.T) {
			_, err := marshalKeyParts("a\x09b")
			require.Error(t, err)
			assert.Equal(t, "key parts can not contains \t", err.Error())
		})
}
