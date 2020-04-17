package transcode

import (
	"path/filepath"

	"github.com/WuLiFang/csheet/pkg/filestore"
	"github.com/WuLiFang/csheet/pkg/model/file"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
	"github.com/WuLiFang/csheet/pkg/transcode"
)

func transcodeImageRegular(p presentation.Presentation) error {
	return filestore.WithTempDir("image-regular-", func(dir string) (err error) {
		raw, err := file.FindByPath(p.Raw)
		if err != nil {
			return
		}
		dst := filepath.Join(dir, replaceExt(filepath.Base(p.Raw), ".jpg"))
		offset, err := getMiddleFrameTimeOffset(p)
		if err != nil {
			return
		}
		cmd := transcode.JPG(p.Raw, dst, &transcode.ImageOptions{
			Height:     1080,
			TimeOffset: offset,
		})

		err = runCommand(cmd)
		if err != nil {
			p.RegularErrorTag = raw.Tag()
			return p.Save()
		}

		filename, err := filestore.Put(dst)
		if err != nil {
			return
		}
		f, err := file.FindOrCreateByPath(filename)
		if err != nil {
			return
		}
		if p.Regular != f.Path {
			removeStoreFile(p.Regular)
		}
		p.Regular = f.Path
		p.RegularSuccessTag = raw.Tag()
		err = p.Save()
		if err != nil {
			return
		}
		logger.Infow("transcoded", "type", p.Type, "target", "regular", "raw", p.Raw)
		return
	})
}
