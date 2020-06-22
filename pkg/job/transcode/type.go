package transcode

import (
	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
)

type jobType int

const (
	// JobTypeImageThumb for jobs that generate 200px height jpg image thumb from raw.
	JobTypeImageThumb jobType = iota
	// JobTypeImageRegular for jobs that for generate 1080px height jpg image from raw.
	JobTypeImageRegular
	// JobTypeVideoRegular for jobs that for generate 1080px mp4 from raw.
	JobTypeVideoRegular
)

func (j jobType) Run(p presentation.Presentation) error {
	switch j {
	case JobTypeImageThumb:
		return transcodeImageThumb(p)
	case JobTypeImageRegular:
		transcodeImageRegular(p)
	case JobTypeVideoRegular:
		transcodeVideoRegular(p)
	default:
		logging.Logger("job.transcode").Sugar().
			DPanicw("unknown job type", "type", j)
	}
	return nil
}

func thumbJobType(t presentation.Type) jobType {
	return JobTypeImageThumb
}

func regularJobType(t presentation.Type) jobType {
	switch t {
	case presentation.TypeImage:
		return JobTypeImageRegular
	case presentation.TypeVideo:
		return JobTypeVideoRegular
	default:
		panic("unknown type")
	}
}
