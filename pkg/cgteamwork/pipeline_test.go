package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPipelines(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))

	t.Run("simple", func(t *testing.T) {
		res, err := Pipelines(ctx, "proj_sdktest")
		require.NoError(t, err)
		assert.NotEmpty(t, res)
		for _, i := range res {
			assert.Equal(t, i.Database, "proj_sdktest")
			assert.NotEmpty(t, i.ID)
			assert.NotEmpty(t, i.Name)
			assert.NotEmpty(t, i.Order)
			assert.NotEmpty(t, i.Module.Name)
			assert.NotEmpty(t, i.Module.Type)
		}
	})
	t.Run("fields", func(t *testing.T) {
		res, err := Pipelines(ctx, "proj_sdktest", PipelinesOptionFields("#id"))
		require.NoError(t, err)
		assert.NotEmpty(t, res)
		for _, i := range res {
			assert.Equal(t, i.Database, "proj_sdktest")
			assert.NotEmpty(t, i.ID)
			assert.Empty(t, i.Name)
			assert.Empty(t, i.Order)
			assert.Empty(t, i.Module.Name)
			assert.Empty(t, i.Module.Type)
			assert.Empty(t, i.Description)
		}
	})
	t.Run("filter", func(t *testing.T) {
		res, err := Pipelines(ctx, "proj_sdktest", PipelinesOptionFilter(F("module").Equal("shot")))
		require.NoError(t, err)
		assert.NotEmpty(t, res)
		for _, i := range res {
			assert.Equal(t, i.Database, "proj_sdktest")
			assert.NotEmpty(t, i.ID)
			assert.NotEmpty(t, i.Name)
			assert.NotEmpty(t, i.Order)
			assert.Equal(t, "shot", i.Module.Name)
			assert.NotEmpty(t, i.Module.Type)
		}
	})
}
