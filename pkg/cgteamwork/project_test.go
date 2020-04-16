package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestListActivateProject(t *testing.T) {
	WithTestContext(t, func(c *Client) {
		ret, err := c.ListActiveProject(context.Background())
		assert.NoError(t, err)
		assert.NotEmpty(t, ret)
	})

}
