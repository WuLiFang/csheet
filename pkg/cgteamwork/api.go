package cgteamwork

import (
	"context"
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"github.com/NateScarlet/zap-sentry/pkg/logging"
	"github.com/tidwall/gjson"
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
		err = APIError{Message: s}
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
func (c *Client) newRequest(ctx context.Context, method string, pathname string, body io.Reader) (r *http.Request, err error) {
	r, err = http.NewRequestWithContext(
		ctx,
		method,
		c.urlWithPath(pathname).String(),
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
	var logger = logging.For(ctx).Logger("cgteamwork.api").Sugar()
	logger.Debugw(
		"send",
		"param", param,
	)
	payload, err := encodeAPIPayload(param)
	if err != nil {
		return
	}
	r, err := c.newRequest(ctx, "POST", "api.php", strings.NewReader(payload))
	if err != nil {
		return
	}
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := http.DefaultClient.Do(r)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	logger.Debugw("recv",
		"body", string(body),
	)
	return parseAPIResult(body)
}
