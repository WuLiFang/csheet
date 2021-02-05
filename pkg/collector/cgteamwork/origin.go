package cgteamwork

import (
	"fmt"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/models/collection"
)

// ParseOrigin to parts
func ParseOrigin(v string) (db string, pipeline string, prefix string, err error) {
	parts := strings.Split(v, collection.OriginSeperator)
	if len(parts) != 4 {
		err = fmt.Errorf("collector.cgteamwork: ParseOrigin: invalid value: %s", v)
		return
	}
	if parts[0] != "cgteamwork" {
		err = fmt.Errorf("collector.cgteamwork: ParseOrigin: invalid value: %s", v)
		return
	}
	return parts[1], parts[2], parts[3], nil
}
