package cgteamwork

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestF(t *testing.T) {

	t.Run("simple", func(t *testing.T) {
		v := F("a", "=", "b")
		j, err := json.Marshal(v)
		assert.NoError(t, err)
		assert.JSONEq(t, `[["a", "=", "b"]]`, string(j))
	})
	t.Run("and", func(t *testing.T) {
		v := F("a", "=", "b").And(F("c", "in", []string{"d"}))
		j, err := json.Marshal(v)
		assert.NoError(t, err)
		assert.JSONEq(t, `[["a", "=", "b"], "and", ["c", "in", ["d"]]]`, string(j))
	})
	t.Run("or", func(t *testing.T) {
		v := F("a", "=", "b").Or(F("c", "in", []string{"d"}))
		j, err := json.Marshal(v)
		assert.NoError(t, err)
		assert.JSONEq(t, `[["a", "=", "b"], "or", ["c", "in", ["d"]]]`, string(j))
	})
	t.Run("complex", func(t *testing.T) {
		v := F("a", "=", "b").And(F("c", "in", []string{"d"})).Or(F("e", "has", "or"))
		j, err := json.Marshal(v)
		assert.NoError(t, err)
		assert.JSONEq(t, `[["a", "=", "b"], "and", ["c", "in", ["d"]], "or", ["e", "has", "or"]]`, string(j))
	})
}
