package cgteamwork

import (
	"os"
	"testing"
)

func NewTestClient(t *testing.T) *Client {
	c, err := NewClientFromEnv()
	if err != nil {
		t.Skip(err)
	}
	c.Username = os.Getenv("CGTEAMWORK_TEST_USERNAME")
	c.Password = os.Getenv("CGTEAMWORK_TEST_PASSWORD")
	if c.Username == "" && c.Password == "" {
		t.Skip("required test account")
	}
	return c
}
