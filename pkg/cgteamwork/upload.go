package cgteamwork

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"go.uber.org/zap"
)

var quoteEscaper = strings.NewReplacer("\\", "\\\\", `"`, "\\\"")

func escapeQuotes(s string) string {
	return quoteEscaper.Replace(s)
}

func contentSize(data []byte, fieldname, filename string, fileSize int) int64 {
	body := new(bytes.Buffer)
	form := multipart.NewWriter(body)
	form.CreateFormFile(fieldname, filename)
	form.Close()
	return int64(body.Len())
}

// UploadOption allow modify upload param before send.
type UploadOption = func(param map[string]string)

// UploadOptionFolder change upload folder
func UploadOptionFolder(folder string) UploadOption {
	return func(param map[string]string) {
		param["folder"] = folder
	}
}

// UploadOptionProject set upload project
func UploadOptionProject(db string) UploadOption {
	return func(param map[string]string) {
		param["type"] = "project"
		param["folder"] = db
	}
}

// UploadImage to server.
// upload to public folder by default.
func UploadImage(ctx context.Context, filename string, file io.Reader, size int64, opts ...UploadOption) (ret Image, err error) {
	logger := logging.For(ctx).Logger("cgteamwork.upload")

	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}
	param := map[string]string{
		"folder":   "_temp",
		"type":     "temp",
		"method":   "convert_image",
		"filename": filename,
	}

	for _, i := range opts {
		i(param)
	}

	data, err := json.Marshal(param)
	if err != nil {
		return
	}
	contentLength := size + int64(len(data)+len([]byte(filename))+345)

	r, w := io.Pipe()
	defer r.Close()
	form := multipart.NewWriter(w)
	uploadDone := make(chan error)

	go func() {
		var err error
		defer func() {
			uploadDone <- err
		}()
		defer w.Close()

		dataPart, err := form.CreateFormField("data")
		if err != nil {
			return
		}
		_, err = dataPart.Write(data)
		if err != nil {
			return
		}

		filePart, err := form.CreateFormFile("file", filename)
		if err != nil {
			return
		}
		_, err = io.Copy(filePart, file)
		if err != nil {
			return
		}
		err = form.Close()
	}()

	req, err := c.newRequest(
		ctx,
		"POST",
		"web_upload_file",
		r,
	)
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", form.FormDataContentType())
	req.ContentLength = contentLength
	logger.Debug("send", zap.Any("param", param), zap.Int64("contentLength", contentLength))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return
	}
	err = <-uploadDone
	if err != nil {
		return
	}
	defer resp.Body.Close()
	data, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	logger.Debug("recv", zap.String("data", string(data)))
	res, err := parseAPIResult(data)
	if err != nil {
		return
	}
	ret.Min = res.Get("min").String()
	ret.Max = res.Get("max").String()
	return
}

// UploadImageFile to server.
func UploadImageFile(ctx context.Context, filename string, opts ...UploadOption) (ret Image, err error) {
	f, err := os.Open(filename)
	if err != nil {
		return
	}
	defer f.Close()

	fi, err := f.Stat()
	if err != nil {
		return
	}
	return UploadImage(ctx, path.Base(filename), f, fi.Size(), opts...)
}
