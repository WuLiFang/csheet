package cgteamwork

import (
	"context"
	"mime"
	"path"
	"strconv"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/apperror"
	"github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	client "github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/collector/base"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/unipath"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
)

// Options for collect collections.
type Options struct {
	Database string
	Prefix   string
	Pipeline string
}

func collectionFromTask(
	ctx context.Context,
	m map[string]collection.Collection,
	task client.Task,
	o Options,
) (created bool, err error) {
	var logger = logging.For(ctx).Logger("collector.cgteamwork").Sugar()

	ret, ok := m[task.Shot.Title]
	if !ok {
		ret.Origin = collection.Origin("cgteamwork", o.Database, o.Pipeline, task.Shot.Title)
		err = ret.Load(ctx)
		if err == db.ErrKeyNotFound {
			err = nil
			created = true
		}
		if err != nil {
			return
		}
		ret.Title = task.Shot.Title
		if ret.Metadata == nil {
			ret.Metadata = map[string]string{}
		}
		ret.Metadata["cgteamwork.pipeline"] = o.Pipeline
	}
	taskData := ret.Metadata["cgteamwork.tasks"]
	if taskData == "" || !gjson.Valid(taskData) {
		taskData = "[]"
	}
	artists := make([]string, 0, len(task.Artists))
	for _, i := range task.Artists {
		artists = append(artists, i.DisplayName)
	}
	var taskDataIndex = 0
	gjson.Parse(taskData).ForEach(func(k, v gjson.Result) bool {
		if v.Get("id").String() == task.ID {
			return false
		}
		taskDataIndex++
		return true
	})
	taskData, err = sjson.Set(taskData, strconv.Itoa(taskDataIndex), map[string]interface{}{
		"id":       task.ID,
		"pipeline": task.Pipeline.Name,
		"artists":  artists,
		"status":   task.Status,
	})
	if err != nil {
		return
	}
	ret.Metadata["cgteamwork.tasks"] = taskData

	presentationIDSet := make(map[string]struct{})
	for _, i := range ret.PresentationIDs {
		presentationIDSet[i] = struct{}{}
	}
	if task.ImageFile != "" {
		logger.Debugw("collect task image file", "task", task.Shot, "path", task.ImageFile)
		p, err := presentation.Put(
			ctx,
			presentation.TypeImage,
			unipath.Auto(task.ImageFile),
		)

		if err == nil {
			presentationIDSet[p.ID()] = struct{}{}
		} else {
			logger.Errorw("put presentation failed", "error", err)
		}
	}
	for _, i := range task.SubmitFile {
		logger.Debugw("collect task submit file", "task", task.Shot, "path", i)
		mt := mime.TypeByExtension(path.Ext(i))
		t, err := presentation.TypeByMimeType(mt)
		if err == nil {
			p, err := presentation.Put(ctx, t, unipath.Auto(i))
			if err == nil {
				presentationIDSet[p.ID()] = struct{}{}
			} else {
				logger.Errorw("put presentation failed", "error", err)
			}
		}
	}
	ret.PresentationIDs = make([]string, 0, len(presentationIDSet))
	for i := range presentationIDSet {
		ret.PresentationIDs = append(ret.PresentationIDs, i)
	}
	ret.CollectTime = time.Now()
	m[task.Shot.Title] = ret
	return
}

// Collect from cgteamwork.
func Collect(ctx context.Context, o Options) (ret base.CollectResult, err error) {
	var logger = logging.For(ctx).Logger("collector.cgteamwork").Sugar()

	logger.Infow("collect", "options", o)
	var started = time.Now()
	defer func() {
		if err != nil {
			logger.Errorw("collect failed", "error", err)
			return
		}
		logger.Infow("collected",
			"result", ret,
			"elapsed", time.Since(started),
		)
	}()

	ret.OriginPrefix = collection.Origin("cgteamwork", o.Database, o.Pipeline, o.Prefix)
	s := cgteamwork.Select(o.Database, "shot").
		WithModuleType("task").
		WithFilter(
			cgteamwork.F("task.pipeline").In(pipelines(o.Pipeline)).
				And(cgteamwork.F("shot.shot").StartsWith(o.Prefix)),
		)

	n, err := s.Count(ctx)
	if err != nil {
		return
	}
	if n > MaxTaskPerCollect {
		err = apperror.NewErrCGTeamworkCollectOverTaskLimit(n, MaxTaskPerCollect)
		return
	}
	rs, err := s.Values(
		ctx,
		"shot.shot", "task.artist", "task.pipeline",
		"task.image", "task.submit_file_path",
		"task.leader_status", "task.director_status", "task.client_status")
	tasks := make([]client.Task, rs.Count())
	rs.Unmarshal(func(i int) client.RecordUnmarshaler {
		return &tasks[i]
	})

	colM := map[string]collection.Collection{}
	for _, v := range tasks {
		var created bool
		created, err = collectionFromTask(ctx, colM, v, o)
		if err != nil {
			return
		}
		// not created not means updated
		// because we reuse previous created collection for same shot
		if created {
			ret.CreatedCount++
		}
	}
	for _, col := range colM {
		err = col.Save(ctx)
		if err != nil {
			return
		}
	}
	ret.UpdatedCount = len(colM) - ret.CreatedCount
	return
}
