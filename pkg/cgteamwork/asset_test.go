package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAssetValues(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	s := Select("proj_sdktest", "asset")
	rs, err := s.Values(ctx, "asset.asset_name", "asset.type_name")
	require.NoError(t, err)
	assets := make([]Asset, rs.Count())

	err = rs.Unmarshal(func(i int) RecordUnmarshaler {
		return &assets[i]
	})
	require.NoError(t, err)
	assert.NotEmpty(t, assets)
	for _, i := range assets {
		assert.NotEmpty(t, i.ID)
		assert.NotEmpty(t, i.Name)
		assert.NotEmpty(t, i.Type)
		assert.NotEmpty(t, i.DisplayNameOrName())
	}
}

func TestAssetCount(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	s := Select("proj_sdktest", "asset")
	n, err := s.Count(ctx)
	require.NoError(t, err)
	assert.Greater(t, n, 0)
}
