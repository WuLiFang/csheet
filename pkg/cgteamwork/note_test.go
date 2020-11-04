package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateNote(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	s := Select("proj_sdktest", "shot").
		WithModuleType("task").
		WithFilter(
			F("shot.shot").Equal("SDKTEST_EP01_01_sc001").
				And(F("task.pipeline").Equal("合成")),
		)

	err := s.CreateNote(ctx, Message{HTML: "test"})
	require.NoError(t, err)
}

func TestNotes(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	s := Select("proj_sdktest", "shot").
		WithModuleType("task").
		WithFilter(
			F("shot.shot").Equal("SDKTEST_EP01_01_sc001").
				And(F("task.pipeline").Equal("合成")),
		)
	err := s.CreateNote(ctx, Message{HTML: "test"})
	require.NoError(t, err)
	res, err := s.Notes(ctx)
	require.NoError(t, err)
	assert.NotEmpty(t, res)
	for _, i := range res {
		assert.NotEmpty(t, i.ID)
		assert.NotEmpty(t, i.TaskID)
		assert.NotEmpty(t, i.Created)
		assert.NotEmpty(t, i.CreatedByID)
		assert.NotEmpty(t, i.CreatedByName)
		assert.NotEmpty(t, i.Module)
		assert.NotEmpty(t, i.ModuleType)
		assert.NotEmpty(t, i.Database)
	}
}

func TestDeleteNote(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	s := Select("proj_sdktest", "shot").
		WithModuleType("task").
		WithFilter(
			F("shot.shot").Equal("SDKTEST_EP01_01_sc001").
				And(F("task.pipeline").Equal("合成")),
		)

	notes, err := s.Notes(ctx)
	require.NoError(t, err)
	if len(notes) == 0 {
		err := s.CreateNote(ctx, Message{HTML: "test"})
		require.NoError(t, err)
		notes, err = s.Notes(ctx)
		require.NoError(t, err)
	}
	ids := make([]string, 0, len(notes))
	for _, i := range notes {
		ids = append(ids, i.ID)
	}
	err = s.DeleteNote(ctx, ids...)
	require.NoError(t, err)
}
