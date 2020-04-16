package cgteamwork

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

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
	result := gjson.ParseBytes(v)
	data = result.Get("data")
	if result.Get("type").String() == "msg" {
		switch data.String() {
		case "please login!!!":
			err = ErrLoginRequired
		default:
			err = fmt.Errorf("api error: %s", data.String())
		}
		return
	}
	return

}

func (c *Client) callAPI(ctx context.Context, param interface{}) (data gjson.Result, err error) {
	logger.Debugw(
		"api send",
		"param", param,
	)
	payload, err := encodeAPIPayload(param)
	if err != nil {
		return
	}
	r, err := http.NewRequestWithContext(
		ctx,
		"POST",
		c.urlWithPath("api.php").String(),
		strings.NewReader(payload),
	)

	if err != nil {
		return
	}
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if c.token != "" {
		r.AddCookie(&http.Cookie{
			Name:  "token",
			Value: c.token,
		})
	}
	resp, err := http.DefaultClient.Do(r)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	logger.Debugw("api recv",
		"body", string(body),
	)
	data, err = parseAPIResult(body)
	return
}
