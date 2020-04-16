package cgteamwork

import (
	"context"
	"time"
)

const tokenLife = 1 * time.Hour

// RefreshToken for client.
func (c *Client) RefreshToken(ctx context.Context) error {
	data, err := c.callAPI(
		ctx,
		map[string]string{
			"controller":  "c_token",
			"method":      "login",
			"account":     c.Username,
			"password":    c.Password,
			"client_type": "py", // web type token seems invalid previous one.
		},
	)
	if err != nil {
		return err
	}
	c.token = data.Get("token").String()
	c.tokenExpireTime = time.Now().Add(tokenLife)

	return nil
}

// RefreshTokenOndemand skip request when token not expired.
func (c *Client) RefreshTokenOndemand(ctx context.Context) error {
	if time.Now().Before(c.tokenExpireTime) {
		return nil
	}
	return c.RefreshToken(ctx)
}
