package db

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSetString(t *testing.T) {
	assert.NoError(t, OpenInMemory())
	defer Close()
	Update(func(txn *Txn) error {
		err := txn.Set(Index(0xffff).Key("string"), "value")
		assert.NoError(t, err)
		return err
	})
	View(func(txn *Txn) error {
		var ret string
		err := txn.Get(Index(0xffff).Key("string"), &ret)
		assert.NoError(t, err)
		assert.Equal(t, "value", ret)
		return err
	})
}

func TestSetInt(t *testing.T) {
	assert.NoError(t, OpenInMemory())
	defer Close()
	Update(func(txn *Txn) error {
		err := txn.Set(Index(0xffff).Key("int"), 1)
		assert.NoError(t, err)
		return err
	})
	View(func(txn *Txn) error {
		var ret int
		err := txn.Get(Index(0xffff).Key("int"), &ret)
		assert.NoError(t, err)
		assert.Equal(t, 1, ret)
		return err
	})
}
