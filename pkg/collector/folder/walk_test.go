package folder

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsInclude(t *testing.T) {
	WalkInclude = ParseWalkRule("*")
	assert.True(t, isInclude("a"))
	WalkInclude = ParseWalkRule("/test/,/test2")
	assert.False(t, isInclude("a"))
	assert.True(t, isInclude("/test/3"))
	WalkExclude = ParseWalkRule("/test/3")
	assert.False(t, isInclude("/test/3"))
}
