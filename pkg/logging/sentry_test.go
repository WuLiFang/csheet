package logging

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSentryStackTrace(t *testing.T) {
	var res = newStackTrace()

	assert.Len(t, res.Frames, 2)
	for _, frame := range res.Frames {
		assert.False(t, frame.InApp)
	}
}
