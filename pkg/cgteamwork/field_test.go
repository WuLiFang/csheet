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
