package cgteamwork

import (
	"context"
	"testing"

	"github.com/NateScarlet/snapshot/pkg/snapshot"
	"github.com/stretchr/testify/require"
)

func TestFlows(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	s := Select("proj_sdktest", "shot").
		WithModuleType("task")

	res, err := s.Flows(ctx)
	require.NoError(t, err)
	snapshot.MatchJSON(t, res)
}

func TestUpdateFlow(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	s := Select("proj_sdktest", "shot").
		WithModuleType("task").
		WithFilter(
			F("shot.shot").Equal("SDKTEST_EP01_01_sc001").
				And(F("task.pipeline").Equal("合成")),
		)
	err := s.UpdateFlow(ctx, "task.leader_status", "Retake", Message{HTML: "golang sdk test"})
	require.NoError(t, err)
	err = s.UpdateFlow(ctx, "task.leader_status", "Close", Message{})
	require.NoError(t, err)
}
