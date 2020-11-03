package cgteamwork

import "context"

// User created on cgteamwork
type User struct {
	ID          string
	Name        string
	DisplayName string
}

// AccountID for given token.
func AccountID(ctx context.Context, token string) (ret string, err error) {
	c := ClientFor(ctx)
	res, err := c.callAPI(
		ctx,
		map[string]string{
			"controller": "c_token",
			"method":     "get_account_id",
			"token":      token,
		},
	)
	if err != nil {
		return
	}
	ret = res.String()
	return
}

// CurrentAccountID for token used in current context.
func CurrentAccountID(ctx context.Context) (ret string, err error) {
	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}
	return AccountID(ctx, c.Token)
}
