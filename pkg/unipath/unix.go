package unipath

import "strings"

// IsUnix check whether a absolute path is a unix path.
func IsUnix(path string) bool {
	return len(path) > 0 && path[0] == '/'
}

// Unix convert a absolute path to unix path.
func Unix(p string) string {
	p = ToSlash(p)
	if IsUnix(p) {
		return p
	}
	for _, r := range Rule {
		lp := strings.ToLower(p)
		winPath := strings.ToLower(r[1])
		if lp == winPath {
			return r[0]
		}
		if strings.HasPrefix(lp, winPath) {
			return r[0] + "/" + p[len(winPath):]
		}
	}
	return p
}
