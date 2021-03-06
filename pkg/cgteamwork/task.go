package cgteamwork

import (
	"encoding/json"
	"strings"
)

// Task created on server
type Task struct {
	ID         string
	Module     string
	Shot       Shot
	Asset      Asset
	Artists    []User
	Pipeline   Pipeline
	ImageFile  string
	SubmitFile []string
}

func max(values ...int) (ret int) {
	for _, i := range values {
		if i > ret {
			ret = i
		}
	}
	return
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (i *Task) UnmarshalCGTeamworkRecord(m map[string]string) error {
	i.ID = m["task.id"]
	i.Pipeline.ID = m["task.flow_id"]
	i.Pipeline.Name = m["task.pipeline"]
	i.Module = m["task.module"]
	i.Shot.UnmarshalCGTeamworkRecord(m)
	i.Asset.UnmarshalCGTeamworkRecord(m)
	if m["task.account_id"] == "" &&
		m["task.artist"] == "" &&
		m["task.account"] == "" {
		i.Artists = []User{}
	} else {
		uid := strings.Split(m["task.account_id"], ",")
		udn := strings.Split(m["task.artist"], ",")
		un := strings.Split(m["task.account"], ",")
		i.Artists = make([]User, max(len(udn), len(un), len(uid)))
		for index, v := range uid {
			i.Artists[index].ID = v
		}
		for index, v := range un {
			i.Artists[index].Name = v
		}
		for index, v := range udn {
			i.Artists[index].DisplayName = v
		}
	}
	img := struct {
		Path string `json:"path"`
	}{}
	json.Unmarshal([]byte(m["task.image"]), &img)
	i.ImageFile = img.Path
	submit := struct {
		Path     []string `json:"path"`
		FilePath []string `json:"file_path"`
	}{}
	json.Unmarshal([]byte(m["task.submit_file_path"]), &submit)
	if len(submit.FilePath) > 0 {
		i.SubmitFile = submit.FilePath
	} else {
		i.SubmitFile = submit.Path
	}

	return nil
}
