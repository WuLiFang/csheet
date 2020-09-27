package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestListActivateProject(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))
	ret, err := ListProjects(
		ctx,
		func(s Selection) Selection {
			return s.WithFilter(F("project.status", "=", "Active"))
		},
	)
	assert.NoError(t, err)
	assert.NotEmpty(t, ret)

}
