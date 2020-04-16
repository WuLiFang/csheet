package cgteamwork

import (
	"os"

	"github.com/tidwall/gjson"
)

func pipelines(pipeline string) []string {
	v := os.Getenv("CSHEET_CGTEAMWORK_PIPELINE_OVERWRITE")
	if v == "" {
		return []string{pipeline}
	}
	data := gjson.Parse(v).Get(pipeline)
	if !data.Exists() {
		return []string{pipeline}
	}
	ret := []string{}
	data.ForEach(func(_, v gjson.Result) bool {
		ret = append(ret, v.String())
		return true
	})
	return ret
}
