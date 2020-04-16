package folder

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestIsInclude(t *testing.T) {

	var err error
	WalkInclude, err = ParseWalkRule("*")
	require.NoError(t, err)
	assert.True(t, isInclude("a"))
	WalkInclude, err = ParseWalkRule("/test/,/test2")
	require.NoError(t, err)
	assert.False(t, isInclude("a"))
	assert.True(t, isInclude("/test/3"))
	WalkExclude, err = ParseWalkRule("/test/3")
	require.NoError(t, err)
	assert.False(t, isInclude("/test/3"))
}
