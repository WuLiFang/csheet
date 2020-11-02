package testutil

import (
	"path"
	"runtime"
)

// WorkspaceRoot returns git root folder of this project.
func WorkspaceRoot() string {
	var _, file, _, _ = runtime.Caller(0)
	return path.Dir(path.Dir(path.Dir(file)))
}

// WorkspacePath under WorkpaceRoot.
func WorkspacePath(elem ...string) string {
	return path.Join(elem...)
}

// CallerRelativePathSkip relative to caller file folder.
func CallerRelativePathSkip(skip int, elem ...string) string {
	var _, file, _, _ = runtime.Caller(skip + 1)
	return path.Join(append([]string{path.Dir(file)}, elem...)...)
}

// CallerRelativePath relative to direct caller file folder.
func CallerRelativePath(parts ...string) string {
	return CallerRelativePathSkip(1, parts...)
}
