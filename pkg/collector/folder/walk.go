package folder

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/WuLiFang/csheet/pkg/unipath"
)

// WalkInclude rules.
var WalkInclude = []string{}

// WalkExclude rules.
var WalkExclude = []string{}

// ParseWalkRule from string.
func ParseWalkRule(v string) (ret []string, err error) {
	if v == "*" {
		return []string{"*"}, nil
	}
	for _, i := range strings.Split(v, ",") {
		if i == "" {
			continue
		}
		ret = append(ret, unipath.Auto(i))
	}
	return
}

func isExclude(p string) bool {
	for _, i := range WalkExclude {
		if filepath.HasPrefix(p, i) {
			return true
		}
	}
	return false
}

func isInclude(p string) bool {
	for _, i := range WalkInclude {
		if i == "*" || filepath.HasPrefix(p, i) {
			return !isExclude(p)
		}
	}
	return false
}

func walk(root string, fn filepath.WalkFunc) error {
	if !isInclude(root) {
		return nil
	}
	return filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		path = unipath.Auto(path)
		if !isInclude(path) {
			return nil
		}
		return fn(path, info, err)
	})
}
