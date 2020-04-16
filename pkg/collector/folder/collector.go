package folder

import (
	"context"
	"errors"
	"mime"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/WuLiFang/csheet/pkg/filestore"
	"github.com/WuLiFang/csheet/pkg/model/collection"
	"github.com/WuLiFang/csheet/pkg/model/event/collected"
	"github.com/WuLiFang/csheet/pkg/model/presentation"
	"github.com/WuLiFang/csheet/pkg/unipath"
)

func validRoot(p string) error {
	storePath, _ := filestore.AbsPath(p)
	p = unipath.Auto(p)
	if strings.HasPrefix(p, storePath) {
		return errors.New("invalid folder root")
	}
	return nil
}

// Collect from folder
func Collect(ctx context.Context, root string) (ret *collected.Event, err error) {
	root = unipath.Auto(root)
	if !filepath.IsAbs(root) {
		err = errors.New("root must be a absolute path")
		return
	}
	ret = new(collected.Event)
	ret.OriginPrefix = collection.Origin("folder", root)
	err = walk(root, func(i string, info os.FileInfo, err error) error {
		select {
		case <-ctx.Done():
			return context.Canceled
		default:
		}
		if err != nil {
			return err
		}
		if info.IsDir() || info.Size() == 0 {
			return nil
		}

		ext := filepath.Ext(i)
		mt := mime.TypeByExtension(ext)
		t, err := presentation.TypeByMimeType(mt)
		if err != nil {
			return nil

		}
		p, err := presentation.FindOrCreate(t, i)
		if err != nil {
			return err
		}

		title := filepath.Base(i)
		title = title[:len(title)-len(ext)]

		var c = new(collection.Collection)
		c.Title = title
		c.Origin = collection.Origin("folder", unipath.Auto(i))
		c.PresentationIDs = append(c.PresentationIDs, p.ID())
		c.CollectTime = time.Now()
		ret.UpdatedCount++

		return c.Save()
	})
	if err != nil {
		return
	}
	err = ret.Save()
	return
}
