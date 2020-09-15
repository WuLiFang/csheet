package folder

import (
	"context"
	"errors"
	"mime"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/WuLiFang/csheet/v6/pkg/collector/base"
	"github.com/WuLiFang/csheet/v6/pkg/db"
	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/WuLiFang/csheet/v6/pkg/model/collection"
	"github.com/WuLiFang/csheet/v6/pkg/model/presentation"
	"github.com/WuLiFang/csheet/v6/pkg/unipath"
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
func Collect(ctx context.Context, root string) (ret base.CollectResult, err error) {
	root = unipath.Auto(root)
	if !filepath.IsAbs(root) {
		err = errors.New("root must be a absolute path")
		return
	}
	ret.OriginPrefix = collection.Origin("folder", root)
	err = walk(root, func(i string, info os.FileInfo, err error) error {
		select {
		case <-ctx.Done():
			return ctx.Err()
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
		p, err := presentation.Put(t, i)
		if err != nil {
			return err
		}

		title := filepath.Base(i)
		title = title[:len(title)-len(ext)]

		var c = new(collection.Collection)
		c.Origin = collection.Origin("folder", unipath.Auto(i))
		err = c.Load()
		if err == nil {
			ret.UpdatedCount++
		} else if errors.Is(err, db.ErrKeyNotFound) {
			ret.CreatedCount++
			err = nil
		}
		if err != nil {
			return err
		}
		c.Title = title
		c.PresentationIDs = append(c.PresentationIDs, p.ID())
		c.CollectTime = time.Now()

		return c.Save()
	})
	if err != nil {
		return
	}
	return
}
