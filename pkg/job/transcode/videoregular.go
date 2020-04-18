package transcode

import (
	"path/filepath"

	"github.com/WuLiFang/csheet/pkg/filestore"
	"github.com/WuLiFang/csheet/pkg/model/file"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
	"github.com/WuLiFang/csheet/pkg/transcode"
)

func transcodeVideoRegular(p presentation.Presentation) error {
	return filestore.WithTempDir("video-regular-", func(dir string) (err error) {
		raw, err := file.FindByPath(p.Raw)
		if err != nil {
			return
		}
		dst := filepath.Join(dir, replaceExt(filepath.Base(p.Raw), ".mp4"))
		if err != nil {
			return
		}
		cmd := transcode.MP4(p.Raw, dst, &transcode.VideoOptions{
			Height:    1080,
			SizeLimit: 256 << 20,
		})

		err = runCommand(cmd)
		if err != nil {
			p.Load()
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
		p.Load()
		p.Regular = f.Path
		p.RegularSuccessTag = raw.Tag()
		err = p.Save()
		if err != nil {
			return
		}
		logger.Infow("transcoded",
			"type", p.Type,
			"target", "regular",
			"raw", p.Raw,
			"dst", p.Regular)
		return
	})
}
