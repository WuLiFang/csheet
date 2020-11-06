package cmd

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"

	"github.com/WuLiFang/csheet/v6/internal/config"
	"github.com/WuLiFang/csheet/v6/pkg/getenv"
	"github.com/tidwall/gjson"
)

func addToken(v map[string]interface{}) error {
	var token = config.AdminToken
	if token == "" {
		return errors.New("missing CSHEET_ADMIN_TOKEN")
	}
	v["token"] = token
	return nil
}

func serverURL() (ret string, err error) {
	ret = getenv.String("CSHEET_URL", "")
	if ret == "" {
		ret = "http://" + config.Address
	}

	u, err := url.Parse("http://" + config.Address)
	if err != nil {
		return
	}

	host, port, _ := net.SplitHostPort(u.Host)
	if host == "0.0.0.0" {
		u.Host = net.JoinHostPort("localhost", port)
	}
	u.Path += "api"

	ret = u.String()
	return

}

func mutate(ctx context.Context, query string, variables interface{}) (res gjson.Result, err error) {

	url, err := serverURL()
	if err != nil {
		return
	}
	payload, err := json.Marshal(map[string]interface{}{
		"query":     query,
		"variables": variables,
	})
	if err != nil {
		return
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	res = gjson.ParseBytes(data)
	if resp.StatusCode != http.StatusOK {
		err = fmt.Errorf("mutate: %s: %s", resp.Status, data)
		return
	}
	return
}

func backup(ctx context.Context) (res gjson.Result, err error) {
	var variables = map[string]interface{}{}
	err = addToken(variables)
	if err != nil {
		return
	}
	return mutate(ctx, `mutation backup(
		$token: String!
	) {
	backupDatabase(
		input: {
			adminToken: $token
		}
	) {
		created{
			path
			modTime
			size
		}
	}
}
`, variables)
}

func restore(ctx context.Context, backupFile string, skipBackup, skipDrop bool) (res gjson.Result, err error) {
	var variables = map[string]interface{}{
		"backupFile": backupFile,
		"skipBackup": skipBackup,
		"skipDrop":   skipDrop,
	}
	err = addToken(variables)
	if err != nil {
		return
	}
	return mutate(ctx, `mutation restore (
		$token: String!
		$backupFile: String!
		$skipBackup: Boolean
		$skipDrop: Boolean
		) {
	restoreDatabase(
		input: {
			adminToken: $token,
			backupFile: $backupFile
			skipBackup: $skipBackup
			skipDrop: $skipDrop
		}
	) {
		backup{
			path
			modTime
			size
		}
		isDropped
	}
}
`, variables)
}
