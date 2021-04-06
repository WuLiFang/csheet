package util

import (
	"strconv"
	"strings"
)

func ParseFrameRate(s string) float64 {
	var parts = strings.SplitN(s, "/", 2)

	var err error
	var base float64
	var div float64
	base, err = strconv.ParseFloat(parts[0], 64)
	if err != nil {
		return 0
	}
	if len(parts) == 1 {
		return base
	}
	div, err = strconv.ParseFloat(parts[1], 64)
	if err != nil {
		return 0
	}
	return base / div

}
