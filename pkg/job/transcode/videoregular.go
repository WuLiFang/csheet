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

func transcodeVideoRegular(ctx context.Context, p presentation.Presentation) error {
	var logger = logging.Logger("job.transcode").Sugar()
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
		p.Load(ctx)
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
