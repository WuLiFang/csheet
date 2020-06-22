package transcode

import (
	"path/filepath"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/transcode"
)

func transcodeImageThumb(p presentation.Presentation) error {
	return filestore.WithTempDir("image-thumb-", func(dir string) (err error) {
		var logger = logging.Logger("job.transcode").Sugar()
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
			Height:     200,
			TimeOffset: offset,
		})
		err = runCommand(cmd)
		if err != nil {
			p.Load()
			p.ThumbErrorTag = raw.Tag()
			return p.Save()
		}

		filename, err := filestore.Put(dst)
		if err != nil {
			return
		}
		if p.Thumb != filename {
			removeStoreFile(p.Thumb)
		}
		p.Load()
		p.Thumb = filename
		p.ThumbSuccessTag = raw.Tag()
		err = p.Save()
		if err != nil {
			return
		}
		logger.Infow("transcoded",
			"type", p.Type,
			"target", "thumb",
			"raw", p.Raw,
			"dst", p.Thumb)
		return
	})
}
