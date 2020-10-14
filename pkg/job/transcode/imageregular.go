package transcode

import (
	"context"
	"path/filepath"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/model/file"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/transcode"
)

func transcodeImageRegular(ctx context.Context, p presentation.Presentation) error {
	return filestore.WithTempDir("image-regular-", func(dir string) (err error) {
		var logger = logging.Logger("job.transode").Sugar()

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
			Height:     2160,
			TimeOffset: offset,
		})

		err = runCommand(cmd)
		if err != nil {
			logger.Errorw("transcode failed",
				"error", err,
				"src", p.Raw,
				"jobType", JobTypeImageRegular)
			p.Load(ctx)
			p.RegularErrorTag = raw.Tag()
			return p.Save(ctx)
		}

		filename, err := filestore.Put(dst)
		if err != nil {
			return
		}
		if p.Regular != filename {
			removeStoreFile(p.Regular)
		}
		err = p.Load(ctx)
		if err != nil {
			return
		}
		p.Regular = filename
		p.RegularSuccessTag = raw.Tag()
		err = p.Save(ctx)
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
