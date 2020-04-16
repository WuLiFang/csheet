package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFindShot(t *testing.T) {
	WithTestContext(t, func(c *Client) {
		s := c.Select("proj_sdktest", "shot")
		rs, err := s.Values(context.Background(), "shot.shot", "eps.id", "eps.eps_name")
		assert.NoError(t, err)
		shots := make([]Shot, rs.Count())

		err = rs.Unmarshal(func(i int) RecordUnmarshaler {
			return &shots[i]
		})
		assert.NoError(t, err)
		assert.NotEmpty(t, shots)
		for _, i := range shots {
			assert.NotEmpty(t, i.ID)
			assert.NotEmpty(t, i.Title)
			assert.NotEmpty(t, i.Episode.ID)
			assert.NotEmpty(t, i.Episode.Name)
		}
	})
}
