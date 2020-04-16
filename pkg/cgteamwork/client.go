package cgteamwork

import (
	"errors"
	"net/url"
	"os"
	"time"
)

// Client for a cgteamwork server.
type Client struct {
	URL             url.URL
	Username        string
	Password        string
	token           string
	tokenExpireTime time.Time
}

func (c *Client) urlWithPath(path string) *url.URL {
	ret := c.URL
	ret.Path = path
	return &ret
}

// DefaultClient for global call, init from env.
var DefaultClient *Client

// NewClientFromEnv create client from environment variables.
func NewClientFromEnv() (*Client, error) {
	urlString := os.Getenv("CGTEAMWORK_URL")
	if urlString == "" {
		return nil, errors.New("required CGTEAMWORK_URL")
	}
	u, err := url.Parse(urlString)
	if err != nil {
		return nil, err
	}
	username := os.Getenv("CGTEAMWORK_USERNAME")
	password := os.Getenv("CGTEAMWORK_PASSWORD")
	return &Client{
		URL:      *u,
		Username: username,
		Password: password,
	}, nil
}

func init() {
	DefaultClient, _ = NewClientFromEnv()
}
