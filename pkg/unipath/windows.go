package unipath

import (
	"strings"
)

// IsWindows check whether a absolute path is a windows path.
func IsWindows(path string) bool {
	parts := strings.Split(path, "\\/")
	return strings.HasSuffix(parts[0], ":")
}

// Windows convert a absolute path to windows path.
func Windows(p string) string {
	p = ToSlash(p)
	p = strings.ToLower(p)
	if IsWindows(p) {
		return p
	}
	for _, r := range Rule {
		if r[0] == p {
			return r[1]
		}
		if strings.HasPrefix(p, strings.ToLower(r[0])+"/") {
			return r[1] + p[len(r[0])+1:]
		}
	}
	return p
}
