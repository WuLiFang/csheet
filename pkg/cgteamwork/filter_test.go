package cgteamwork

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestF(t *testing.T) {

	t.Run("simple", func(t *testing.T) {
		v := F("a").Equal("b")
		j, err := json.Marshal(v)
		assert.NoError(t, err)
		assert.JSONEq(t, `[["a", "=", "b"]]`, string(j))
	})
	t.Run("and", func(t *testing.T) {
		v := F("a").Equal("b").And(F("c").In([]string{"d"}))
		j, err := json.Marshal(v)
		assert.NoError(t, err)
		assert.JSONEq(t, `[["a", "=", "b"], "and", ["c", "in", ["d"]]]`, string(j))
	})
	t.Run("or", func(t *testing.T) {
		v := F("a").Equal("b").Or(F("c").In([]string{"d"}))
		j, err := json.Marshal(v)
		assert.NoError(t, err)
		assert.JSONEq(t, `[["a", "=", "b"], "or", ["c", "in", ["d"]]]`, string(j))
	})
	t.Run("complex", func(t *testing.T) {
		v := F("a").Equal("b").And(F("c").In([]string{"d"})).Or(F("e").Has("or"))
		j, err := json.Marshal(v)
		assert.NoError(t, err)
		assert.JSONEq(t, `[["a", "=", "b"], "and", ["c", "in", ["d"]], "or", ["e", "has", "or"]]`, string(j))
	})
}
