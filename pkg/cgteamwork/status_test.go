package cgteamwork

import (
	"context"
	"testing"

	"github.com/NateScarlet/snapshot/pkg/snapshot"
	"github.com/stretchr/testify/require"
)

func TestStatuses(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	res, err := Statuses(ctx)
	require.NoError(t, err)
	snapshot.MatchJSON(t, res)
}
