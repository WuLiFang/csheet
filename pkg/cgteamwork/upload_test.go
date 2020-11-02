package cgteamwork

import (
	"context"
	"os"
	"testing"

	"github.com/WuLiFang/csheet/v6/pkg/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUploadImage(t *testing.T) {
	ctx := WithClient(context.Background(), NewTestClient(t))

	t.Run("simple", func(t *testing.T) {
		f, err := os.Open(testutil.CallerRelativePath("testdata/gray.png"))
		require.NoError(t, err)
		defer f.Close()
		fi, err := f.Stat()
		require.NoError(t, err)
		res, err := UploadImage(ctx, "gray.png", f, fi.Size())
		require.NoError(t, err)
		assert.Equal(t, "/upload/_temp/max/fa10cc526b7959e7e61caf24d510d3db.png", res.Max)
		assert.Equal(t, "/upload/_temp/min/fa10cc526b7959e7e61caf24d510d3db.png", res.Min)
	})
	t.Run("upload-file", func(t *testing.T) {
		res, err := UploadImageFile(ctx, testutil.CallerRelativePath("testdata/gray.png"))
		require.NoError(t, err)
		assert.Equal(t, "/upload/_temp/max/fa10cc526b7959e7e61caf24d510d3db.png", res.Max)
		assert.Equal(t, "/upload/_temp/min/fa10cc526b7959e7e61caf24d510d3db.png", res.Min)
	})
	t.Run("custom-folder", func(t *testing.T) {
		res, err := UploadImageFile(ctx, testutil.CallerRelativePath("testdata/gray.png"), UploadOptionFolder("_test"))
		require.NoError(t, err)
		assert.Equal(t, "/upload/_test/max/fa10cc526b7959e7e61caf24d510d3db.png", res.Max)
		assert.Equal(t, "/upload/_test/min/fa10cc526b7959e7e61caf24d510d3db.png", res.Min)
	})
	t.Run("other-file", func(t *testing.T) {
		res, err := UploadImageFile(ctx, testutil.CallerRelativePath("testdata/1x1.png"))
		require.NoError(t, err)
		assert.Equal(t, "/upload/_temp/min/91e42db1c66c0b276abf6234dc50b2eb.png", res.Max)
		assert.Equal(t, "/upload/_temp/min/91e42db1c66c0b276abf6234dc50b2eb.png", res.Min)
	})
}
