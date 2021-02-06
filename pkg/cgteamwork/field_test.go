package cgteamwork

import (
	"context"
	"testing"

	"github.com/NateScarlet/snapshot/pkg/snapshot"
	"github.com/stretchr/testify/require"
)

func TestFieldFetch(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	f := Field{
		Database: "proj_sdktest",
		ID:       "2920928F-68D2-2441-21CF-00CFF17AC97C",
	}
	err := f.Fetch(ctx)
	require.NoError(t, err)
	snapshot.MatchJSON(t, f)
}

func TestFields(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	t.Run("simple", func(t *testing.T) {
		result, err := Fields(ctx, "proj_sdktest")
		require.NoError(t, err)
		snapshot.MatchJSON(t, result)
	})
	t.Run("filter", func(t *testing.T) {
		result, err := Fields(ctx, "proj_sdktest", FieldOptionFilter(F("type").Equal("checkbox")))
		require.NoError(t, err)
		snapshot.MatchJSON(t, result)
	})
	t.Run("fields", func(t *testing.T) {
		result, err := Fields(ctx, "proj_sdktest", FieldOptionFields([]string{"sign"}))
		require.NoError(t, err)
		snapshot.MatchJSON(t, result)
	})
}
