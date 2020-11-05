package resolvers

import (
	"crypto/subtle"
	"errors"

	"github.com/WuLiFang/csheet/v6/internal/config"
)

func verifyAdminToken(v string) error {
	if config.AdminToken == "" {
		return errors.New("admin disabled")
	}

	if subtle.ConstantTimeCompare([]byte(v), []byte(config.AdminToken)) == 0 {
		return errors.New("invalid admin token")
	}
	return nil
}
