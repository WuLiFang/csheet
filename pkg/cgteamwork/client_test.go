package cgteamwork

import (
	"os"
	"testing"
)

func WithTestClient(t *testing.T, fn func(c *Client)) {
	c, err := NewClientFromEnv()
	if err != nil {
		t.Skip("required CGTEAMWORK_URL")
	}
	c.Username = os.Getenv("CGTEAMWORK_TEST_USERNAME")
	c.Password = os.Getenv("CGTEAMWORK_TEST_PASSWORD")
	fn(c)
}

func WithTestContext(t *testing.T, fn func(c *Client)) {
	c, err := NewClientFromEnv()
	if err != nil {
		t.Skip()
		return
	}
	c.Username = os.Getenv("CGTEAMWORK_TEST_USERNAME")
	c.Password = os.Getenv("CGTEAMWORK_TEST_PASSWORD")
	WithTestClient(t, func(c *Client) {
		if c.Username == "" && c.Password == "" {
			t.Skip("required test account")
			return
		}
		fn(c)
	})
}
