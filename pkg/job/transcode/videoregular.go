package transcode

import (
	"context"
	"path/filepath"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/transcode"
)

func transcodeVideoRegular(ctx context.Context, p presentation.Presentation) error {
	var logger = logging.Logger("job.transcode").Sugar()
	return filestore.WithTempDir("video-regular-", func(dir string) (err error) {
		dst := filepath.Join(dir, replaceExt(filepath.Base(p.Raw), ".mp4"))
		if err != nil {
			return
		}

		cmd := transcode.MP4(p.Raw, dst, &transcode.VideoOptions{
			Width:     1920,
			SizeLimit: 256 << 20,
		})

		err = runCommand(cmd)
		rawTag := p.RawTag()
		if err != nil {
			p.Load(ctx)
			p.RegularErrorTag = rawTag
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
		p.RegularSuccessTag = rawTag
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
