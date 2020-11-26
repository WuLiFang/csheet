package cgteamwork

import (
	"context"
	"errors"
	"fmt"
	"mime"
	"path"
	"strconv"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/WuLiFang/csheet/v6/pkg/apperror"
	client "github.com/WuLiFang/csheet/v6/pkg/cgteamwork"
	"github.com/WuLiFang/csheet/v6/pkg/collector/base"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/unipath"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
	"go.uber.org/zap"
)

// Options for collect collections.
type Options struct {
	Database string
	Prefix   string
	Pipeline string
}

var errEmptyKey = errors.New("collectionFromTask: empty key")

func findPipelineByName(ctx context.Context, db string, pipeline string) (ret client.Pipeline, err error) {
	res, err := client.Pipelines(ctx, db, client.PipelinesOptionFilter(client.F("entity_name").Equal(pipeline)))
	if err != nil {
		return
	}
	if len(res) == 0 {
		err = apperror.NewErrCGTeamworkPipelineNotFound(pipeline)
		return
	}
	if len(res) > 1 {
		logging.Logger("collector.cgteamwork").DPanic("duplicated pipeline",
			zap.String("database", db),
			zap.String("name", pipeline),
			zap.Any("result", res),
		)
	}
	ret = res[0]
	return
}

func collectionFromTask(
	ctx context.Context,
	m map[string]collection.Collection,
	task client.Task,
	o Options,
) (created bool, err error) {
	var logger = logging.For(ctx).Logger("collector.cgteamwork").Sugar()

	var key string

	switch task.Module {
	case "shot":
		key = task.Shot.Title
	case "asset":
		key = task.Asset.Name
	}
	if key == "" {
		err = errEmptyKey
		return
	}

	ret, ok := m[key]
	if !ok {
		ret.Origin = collection.Origin("cgteamwork", o.Database, o.Pipeline, key)
		err = ret.Load(ctx)
		if err == db.ErrKeyNotFound {
			err = nil
			created = true
		}
		if err != nil {
			return
		}
		switch task.Module {
		case "shot":
			ret.Title = task.Shot.Title
		case "asset":
			if task.Asset.DisplayName != "" && task.Asset.DisplayName != task.Asset.Name {
				ret.Title = fmt.Sprintf("[%s] %s", task.Asset.Name, task.Asset.DisplayName)
			} else {
				ret.Title = task.Asset.Name
			}
		}
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
	m[key] = ret
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

	pipeline, err := findPipelineByName(ctx, o.Database, o.Pipeline)
	if err != nil {
		return
	}

	ret.OriginPrefix = collection.Origin("cgteamwork", o.Database, o.Pipeline, o.Prefix)
	var keyField string
	switch pipeline.Module.Name {
	case "shot":
		keyField = "shot.shot"
	case "asset":
		keyField = "asset.asset_name"
	}
	if keyField == "" {
		err = fmt.Errorf("collector.cgteamwork: pipeline not supported: %s", o.Pipeline)
		return
	}
	s := client.Select(o.Database, pipeline.Module.Name).
		WithModuleType(pipeline.Module.Type).
		WithFilter(
			client.F("task.pipeline").In(pipelines(o.Pipeline)).
				And(client.F(keyField).StartsWith(o.Prefix)),
		)

	n, err := s.Count(ctx)
	if err != nil {
		return
	}
	if n == 0 {
		return
	}
	if n > MaxTaskPerCollect {
		err = apperror.NewErrCGTeamworkCollectOverTaskLimit(n, MaxTaskPerCollect)
		return
	}
	var fields = []string{
		keyField, "task.artist", "task.pipeline",
		"task.image", "task.submit_file_path",
		"task.leader_status", "task.director_status", "task.client_status",
	}
	switch pipeline.Module.Name {
	case "asset":
		fields = append(fields, "asset.cn_name")
	}
	rs, err := s.Values(ctx, fields...)
	if err != nil {
		return
	}
	rs.SetDefault("task.module", pipeline.Module.Name)
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
