package collected

import (
	"testing"

	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGallerySave(t *testing.T) {

	err := db.OpenInMemory()
	defer db.Close()
	require.NoError(t, err)
	e := Event{OriginPrefix: "test:a", UpdatedCount: 100}
	err = e.Save()
	require.NoError(t, err)
	assert.NotEmpty(t, e.Time)

	e2, err := FindByID(e.ID())
	require.NoError(t, err)
	assert.Equal(t, e.OriginPrefix, e2.OriginPrefix)
	assert.Equal(t, e.Time.Unix(), e2.Time.Unix())
	assert.Equal(t, e.UpdatedCount, e2.UpdatedCount)
}
