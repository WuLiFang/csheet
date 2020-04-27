package presentation

import (
	"testing"

	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFindByRaw(t *testing.T) {
	err := db.OpenInMemory()
	require.NoError(t, err)
	defer db.Close()

	err = Presentation{
		Type: "image",
		Raw:  "test",
	}.Save()
	require.NoError(t, err)
	result, err := FindByPath("test")
	require.NoError(t, err)
	assert.Len(t, result, 1)
}
