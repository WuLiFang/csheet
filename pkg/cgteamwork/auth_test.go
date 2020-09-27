package cgteamwork

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRefreshToken(t *testing.T) {
	c := NewTestClient(t)
	err := c.RefreshToken(context.Background())
	assert.NoError(t, err)
	assert.NotEmpty(t, c.token)
	assert.NotEmpty(t, c.tokenExpireTime)
}
