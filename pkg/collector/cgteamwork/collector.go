package cgteamwork

import (
	"context"
	"mime"
	"path"
	"time"

	client "github.com/WuLiFang/csheet/pkg/cgteamwork"
	"github.com/WuLiFang/csheet/pkg/db"
	"github.com/WuLiFang/csheet/pkg/model/collection"
	"github.com/WuLiFang/csheet/pkg/model/event/collected"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
	"github.com/WuLiFang/csheet/pkg/unipath"
	"github.com/tidwall/gjson"
	"github.com/tidwall/sjson"
)

// Options for collect collections.
type Options struct {
	Database string
	Prefix   string
	Pipeline string
}

func collectionFromTask(m map[string]collection.Collection, task client.Task, o Options) (err error) {
	ret, ok := m[task.Shot.Title]
	if !ok {
		ret, err = collection.FindByID(task.ID)
		if err == db.ErrKeyNotFound {
			err = nil
		}
		if err != nil {
			return
		}
		ret.Origin = collection.Origin("cgteamwork", o.Database, o.Pipeline, task.Shot.Title)
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
	taskDataKey := "-1"
	gjson.Parse(taskData).ForEach(func(k, v gjson.Result) bool {
		if v.Get("id").String() == task.ID {
			taskDataKey = k.String()
			return false
		}
		return true
	})
	taskData, err = sjson.Set(taskData, taskDataKey, map[string]interface{}{
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
		p, err := presentation.FindOrCreate(
			presentation.TypeImage,
			unipath.Auto(task.ImageFile),
		)

		if err == nil {
			presentationIDSet[p.ID()] = struct{}{}
		}
	}
	for _, i := range task.SubmitFile {
		mt := mime.TypeByExtension(path.Ext(i))
		t, err := presentation.TypeByMimeType(mt)
		if err == nil {
			p, err := presentation.FindOrCreate(t, unipath.Auto(i))
			if err == nil {
				presentationIDSet[p.ID()] = struct{}{}
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

// CollectWithClient gallery with given client.
func CollectWithClient(ctx context.Context, c *client.Client, o Options) (ret *collected.Event, err error) {
	ret = new(collected.Event)
	ret.OriginPrefix = collection.Origin("cgteamwork", o.Database, o.Pipeline, o.Prefix)
	s := c.Select(o.Database, "shot").
		WithModuleType("task").
		WithFilter(
			c.F("task.pipeline", "in", pipelines(o.Pipeline)).
				And(c.F("shot.shot", "has", o.Prefix+"%")),
		)
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
		select {
		case <-ctx.Done():
			err = context.Canceled
			return
		default:
		}
		err = collectionFromTask(colM, v, o)
		if err != nil {
			return
		}
	}
	for _, col := range colM {
		select {
		case <-ctx.Done():
			err = context.Canceled
			return
		default:
		}
		err = col.Save()
		if err != nil {
			return
		}
	}
	ret.UpdatedCount = len(colM)
	err = ret.Save()
	return
}

// Collect collections with default client.
func Collect(ctx context.Context, o Options) (*collected.Event, error) {
	return CollectWithClient(ctx, client.DefaultClient, o)
}
