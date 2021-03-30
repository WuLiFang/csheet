package archive

import (
	"archive/zip"
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"strings"

	"github.com/WuLiFang/csheet/v6/pkg/filestore"
	"github.com/tidwall/gjson"
)

func zipAssets(zw *zip.Writer) (err error) {
	assetsFile, err := os.Open("dist/assets.static.txt")
	if err != nil {
		return
	}
	defer assetsFile.Close()

	var addFile = func(name string) (err error) {
		w, err := zw.Create(name)
		if err != nil {
			return
		}
		r, err := os.Open(path.Join("dist", name))
		if err != nil {
			return
		}
		defer r.Close()
		_, err = io.Copy(w, r)
		if err != nil {
			return
		}
		return
	}

	scanner := bufio.NewScanner(assetsFile)
	for scanner.Scan() {
		var v = scanner.Text()
		if v == "" {
			continue
		}
		err = addFile(v)
		if err != nil {
			return
		}

	}
	return
}

func zipFiles(zw *zip.Writer, pageData json.RawMessage) (err error) {
	var addFile = func(url string) (err error) {
		if url == "" {
			return
		}
		if !strings.HasPrefix(url, "/files/") {
			err = fmt.Errorf("unsupported file url: %s", url)
			return
		}
		var name = strings.TrimPrefix(url, "/files/")

		r, err := os.Open(path.Join(filestore.Dir, name))
		if errors.Is(err, os.ErrNotExist) {
			err = nil
			return
		}
		if err != nil {
			return
		}
		defer r.Close()

		w, err := zw.Create(path.Join("files/", name))
		if err != nil {
			return
		}

		_, err = io.Copy(w, r)
		if err != nil {
			return
		}
		return
	}

	gjson.GetBytes(pageData, "collections.nodes.#.presentations|@flatten").ForEach(func(key, value gjson.Result) bool {
		err = addFile(value.Get("thumb.url").String())
		if err != nil {
			return false
		}
		err = addFile(value.Get("regular.url").String())
		if err != nil {
			return false
		}
		return true
	})
	return
}

func Zip(ctx context.Context, w io.Writer, opts ...PageOption) (err error) {
	type M = map[string]interface{}
	type A = []interface{}
	var zw = zip.NewWriter(w)
	defer zw.Close()

	data, err := PageData(ctx, opts...)
	if err != nil {
		return
	}

	f, err := zw.Create("index.html")
	if err != nil {
		return
	}
	err = RenderIndex(f, data)
	if err != nil {
		return
	}

	err = zipAssets(zw)
	if err != nil {
		return
	}

	_, err = zw.Create("!解压到单独文件夹后再查看，不支持直接在压缩软件中运行")
	if err != nil {
		return
	}

	f, err = zw.Create("打开.cmd")
	if err != nil {
		return
	}
	_, err = f.Write([]byte(`"%~dp0/index.html"`))
	if err != nil {
		return
	}

	err = zipFiles(zw, data)
	if err != nil {
		return
	}
	return
}
