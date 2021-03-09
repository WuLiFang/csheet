package base

import "regexp"

// TODO: rename package name to core

// IgnoreRegex match paths that need ignore.
var IgnoreRegex []regexp.Regexp

// ShouldIgnore path
func ShouldIgnore(path string) bool {
	for _, i := range IgnoreRegex {
		if i.FindStringIndex(path) != nil {
			return true
		}
	}
	return false
}
