package unipath

import (
	"os"
	"strings"
)

// DefaultRule map root folder to windows driver.
var DefaultRule [][2]string

// Rule map unix prefix to windows path prefix.
var Rule [][2]string

const asciiLower = "abcdefghijklmnopqrstuvwxyz"

func init() {
	for _, c := range asciiLower {
		s := string(c)
		DefaultRule = append(DefaultRule,
			[2]string{"/" + s, s + ":/"},
		)
	}
	r := os.Getenv("UNIPATH_RULE")
	if r == "" {
		Rule = DefaultRule
	} else {
		items := strings.Split(r, ",")
		for i := 0; i < len(items)-1; i += 2 {
			Rule = append(
				Rule,
				[2]string{items[i], strings.ToLower(items[i+1])},
			)
		}
	}
}
