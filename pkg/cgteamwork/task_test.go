package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUnmarshalTask(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))

	s := Select("proj_sdktest", "shot").
		WithModuleType("task").
		WithFilter(F("shot.shot", "=", "SDKTEST_EP01_01_sc001"))
	rs, err := s.Values(
		ctx,
		"shot.id", "shot.shot",
		"task.account_id", "task.artist", "task.account",
		"task.flow_id", "task.pipeline",
		"task.image", "task.submit_file_path",
	)
	assert.NoError(t, err)
	tasks := make([]Task, rs.Count())
	rs.Unmarshal(func(i int) RecordUnmarshaler {
		return &tasks[i]
	})
	assert.NotEmpty(t, tasks)
	assert.NoError(t, err)
	for _, i := range tasks {
		assert.NotEmpty(t, i.Shot.ID)
		assert.NotEmpty(t, i.Shot.Title)
	}
}
