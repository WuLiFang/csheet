package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestShotValues(t *testing.T) {
	WithTestContext(t, func(c *Client) {
		s := c.Select("proj_sdktest", "shot")
		rs, err := s.Values(context.Background(), "shot.shot", "eps.id", "eps.eps_name")
		require.NoError(t, err)
		shots := make([]Shot, rs.Count())

		err = rs.Unmarshal(func(i int) RecordUnmarshaler {
			return &shots[i]
		})
		require.NoError(t, err)
		assert.NotEmpty(t, shots)
		for _, i := range shots {
			assert.NotEmpty(t, i.ID)
			assert.NotEmpty(t, i.Title)
			assert.NotEmpty(t, i.Episode.ID)
			assert.NotEmpty(t, i.Episode.Name)
		}
	})
}

func TestShotCount(t *testing.T) {
	WithTestContext(t, func(c *Client) {
		s := c.Select("proj_sdktest", "shot")
		n, err := s.Count(context.Background())
		require.NoError(t, err)
		assert.Greater(t, n, 0)
	})
}
