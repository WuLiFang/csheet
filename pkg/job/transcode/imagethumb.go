package transcode

import (
	"context"
	"path/filepath"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/models/file"
	"github.com/WuLiFang/csheet/v6/pkg/models/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/transcode"
)

func transcodeImageThumb(ctx context.Context, p presentation.Presentation) error {
	return filestore.WithTempDir("image-thumb-", func(dir string) (err error) {
		var logger = logging.Logger("job.transcode").Sugar()
		raw, err := file.FindByPath(p.Raw)
		if err != nil {
			return
		}

		dst := filepath.Join(dir, replaceExt(filepath.Base(p.Raw), extByPixelFormat(p.Metadata["pixel-format"])))

		offset, err := getMiddleFrameTimeOffset(p)
		if err != nil {
			return
		}
		cmd := transcodeImage(p.Raw, dst, &transcode.ImageOptions{
			Width:      512,
			TimeOffset: offset,
		})
		err = runCommand(cmd)
		if err != nil {
			p.Load(ctx)
			p.ThumbErrorTag = raw.Tag()
			return p.Save(ctx)
		}

		filename, err := filestore.Put(dst)
		if err != nil {
			return
		}
		if p.Thumb != filename {
			removeStoreFile(p.Thumb)
		}
		err = p.Load(ctx)
		if err != nil {
			return
		}
		p.Thumb = filename
		p.ThumbSuccessTag = raw.Tag()
		err = p.Save(ctx)
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
