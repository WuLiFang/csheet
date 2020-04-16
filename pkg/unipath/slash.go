package unipath

import "strings"

// ToSlash convert all possible separator to slash.
func ToSlash(p string) string {
	return strings.ReplaceAll(p, "\\", "/")
}
