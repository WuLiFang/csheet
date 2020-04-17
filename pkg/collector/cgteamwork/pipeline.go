package cgteamwork

import (
	"github.com/tidwall/gjson"
)

func pipelines(pipeline string) []string {
	data := PipelineOverwrite.Get(pipeline)
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
