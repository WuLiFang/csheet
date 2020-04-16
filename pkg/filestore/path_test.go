package filestore

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNormalizePath(t *testing.T) {
	t.Run("inside", func(t *testing.T) {
		p, err := filepath.Abs(filepath.Join(Dir, "abc/def"))
		require.NoError(t, err)
		result, err := NormalizePath(p)
		require.NoError(t, err)
		assert.Equal(t, "abc/def", result)
	})
	t.Run("outside", func(t *testing.T) {
		result, err := NormalizePath("/NOT_EXISTED/FOLDER")
		require.NoError(t, err)
		assert.Equal(t, "/NOT_EXISTED/FOLDER", result)
	})
	t.Run("relative", func(t *testing.T) {
		result, err := NormalizePath("abc/def")
		require.NoError(t, err)
		assert.Equal(t, "abc/def", result)
	})
}

func TestAbsPath(t *testing.T) {
	t.Run("relative", func(t *testing.T) {
		result, err := AbsPath("abc/def")
		require.NoError(t, err)
		expected, err := filepath.Abs(filepath.Join(Dir, "abc/def"))
		assert.Equal(t, expected, result)
	})
	t.Run("absolute", func(t *testing.T) {
		p, err := filepath.Abs("/NOT_EXISTED/FOLDER")
		require.NoError(t, err)
		result, err := AbsPath(p)
		require.NoError(t, err)
		assert.Equal(t, p, result)
	})
}
