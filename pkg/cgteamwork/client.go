package cgteamwork

import (
	"context"
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
	Token           string
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

type contextKey struct{}

// ClientFor get client for context.
func ClientFor(ctx context.Context) *Client {
	ret, ok := ctx.Value(contextKey{}).(*Client)
	if !ok {
		return DefaultClient
	}
	return ret
}

// WithClient create a new context that will use given client.
func WithClient(ctx context.Context, c *Client) context.Context {
	return context.WithValue(ctx, contextKey{}, c)
}
