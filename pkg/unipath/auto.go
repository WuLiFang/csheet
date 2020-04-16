package unipath

import "runtime"

// Auto convert a absolute path for current platform.
func Auto(path string) string {
	if runtime.GOOS == "windows" {
		return Windows(path)
	}
	return Unix(path)
}
