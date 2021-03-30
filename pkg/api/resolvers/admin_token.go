package resolvers

import (
	"crypto/subtle"
	"errors"
)

func verifyAdminToken(v string) error {
	if AdminToken == "" {
		return errors.New("admin disabled")
	}

	if subtle.ConstantTimeCompare([]byte(v), []byte(AdminToken)) == 0 {
		return errors.New("invalid admin token")
	}
	return nil
}
