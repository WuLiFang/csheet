package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"
)

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
