package cgteamwork

import (
	"context"
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/tidwall/gjson"
	"go.uber.org/zap"
)

func encodeAPIPayload(data interface{}) (string, error) {
	d, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	form := url.Values{
		"data": []string{string(d)},
	}
	return form.Encode(), err
}

func parseAPIResult(v []byte) (data gjson.Result, err error) {
	var s = string(v)
	if !gjson.Valid(s) {
		err = APIError{Message: "invalid json:" + s}
		return
	}
	result := gjson.Parse(s)
	data = result.Get("data")
	if result.Get("type").String() == "msg" {
		err = APIError{Message: data.String()}
		return
	}
	return
}

// newRequest with token set.
func (c *Client) newRequest(ctx context.Context, method string, url string, body io.Reader) (r *http.Request, err error) {
	if c == nil {
		err = ErrNotConfigured
		return
	}
	r, err = http.NewRequestWithContext(
		ctx,
		method,
		url,
		body,
	)
	if err != nil {
		return
	}
	if c.Token != "" {
		r.AddCookie(&http.Cookie{
			Name:  "token",
			Value: c.Token,
		})
	}
	return
}

func (c *Client) callAPI(ctx context.Context, param interface{}) (data gjson.Result, err error) {
	if c == nil {
		err = ErrNotConfigured
		return
	}
	var logger = logging.For(ctx).Logger("cgteamwork.api")
	var startTime = time.Now()
	logger.Debug(
		"send",
		zap.Any("param", param),
	)
	payload, err := encodeAPIPayload(param)
	if err != nil {
		return
	}
	r, err := c.newRequest(ctx, "POST", c.urlWithPath("api.php").String(), strings.NewReader(payload))
	if err != nil {
		return
	}
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := c.do(r)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	logger.Debug(
		"recv",
		zap.ByteString("body", body),
		zap.Duration("elapsed", time.Since(startTime)),
	)
	return parseAPIResult(body)
}

func (c *Client) getJSON(ctx context.Context, path string, param *url.Values) (ret gjson.Result, err error) {
	if c == nil {
		err = ErrNotConfigured
		return
	}
	var logger = logging.For(ctx).Logger("cgteamwork.api")
	var startTime = time.Now()
	logger.Debug(
		"get",
		zap.String("path", path),
		zap.Any("param", param),
	)
	var u = c.urlWithPath(path)
	if param != nil {
		u.RawQuery = param.Encode()
	}
	r, err := c.newRequest(ctx, "GET", u.String(), nil)
	if err != nil {
		return
	}
	resp, err := c.do(r)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	logger.Debug(
		"recv",
		zap.ByteString("body", body),
		zap.Duration("elapsed", time.Since(startTime)),
	)
	if !gjson.ValidBytes(body) {
		err = APIError{Message: "invalid json:" + string(body)}
		return
	}
	ret = gjson.ParseBytes(body)
	return
}
