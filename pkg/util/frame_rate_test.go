package util

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseFrameRate(t *testing.T) {
	for _, c := range []struct {
		s        string
		expected float64
	}{
		{s: "25/1", expected: 25},
		{s: "24/1", expected: 24},
		{s: "24", expected: 24},
		{s: "24/", expected: 0},
		{s: "", expected: 0},
		{s: "a", expected: 0},
	} {
		t.Run(c.s, func(t *testing.T) {
			assert.Equal(t, c.expected, ParseFrameRate(c.s))
		})
	}
}
