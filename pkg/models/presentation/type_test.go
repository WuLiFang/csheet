package presentation

import (
	"mime"
	"testing"

	_ "github.com/WuLiFang/csheet/v6/pkg/mime"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTypeByMimeType(t *testing.T) {
	cases := []struct {
		ext      string
		expected Type
	}{
		{".mov", TypeVideo},
		{".mp4", TypeVideo},
		{".jpg", TypeImage},
		{".png", TypeImage},
		{".jpeg", TypeImage},
		{".bmp", TypeImage},
		{".tga", TypeImage},
		{".tiff", TypeImage},
	}
	for _, i := range cases {
		c := i
		t.Run(i.ext, func(t *testing.T) {
			mt := mime.TypeByExtension(c.ext)
			require.NotEqual(t, "", mt)
			result, err := TypeByMimeType(mt)
			t.Log(mt)
			require.NoError(t, err)
			assert.Equal(t, c.expected, result)
		})
	}
}
