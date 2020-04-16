package counter

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCounter(t *testing.T) {
	c := new(Counter)
	result := c.Add("a", 1)
	assert.Equal(t, 1, result)
	assert.Equal(t, 1, c.Get("a"))
	assert.Equal(t, 0, c.Get("b"))
}
