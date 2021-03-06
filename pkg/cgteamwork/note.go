package cgteamwork

import (
	"context"
	"strings"
	"time"

	"github.com/tidwall/gjson"
)

// Note on task
type Note struct {
	Database      string
	ID            string
	TaskID        string
	ParentID      string
	Module        string
	ModuleType    string
	Created       time.Time
	CreatedByID   string
	CreatedByName string
	Type          string
	Message       Message
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (n *Note) UnmarshalCGTeamworkRecord(v map[string]string) error {
	n.ID = v["#id"]
	n.TaskID = v["#task_id"]
	n.ParentID = v["parent_id"]
	n.Created, _ = time.ParseInLocation("2006-01-02 15:04:05", v["create_time"], time.FixedZone("UTC+8", 8*3600))
	n.CreatedByID = v["#from_account_id"]
	n.CreatedByName = v["create_by"]
	n.Module = v["module"]
	n.ModuleType = v["module_type"]
	n.Type = v["type"]

	// parse message
	msg := gjson.Parse(v["text"])
	n.Message.HTML = msg.Get("data").String()
	n.Message.Images = nil
	msg.Get("image").ForEach(func(key, value gjson.Result) bool {
		n.Message.Images = append(n.Message.Images, Image{
			Max: value.Get("max").String(),
			Min: value.Get("min").String(),
		})
		return true
	})

	return nil
}

// Notes returns notes for first task in selection.
func (s Selection) Notes(ctx context.Context, fields ...string) (ret []Note, err error) {
	ids, err := s.resolveIDs(ctx)
	if err != nil {
		return
	}
	if len(ids) == 0 {
		return
	}
	taskID := ids[0]

	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}
	if len(fields) == 0 {
		fields = []string{
			"#id",
			"#task_id",
			"#from_account_id",
			"text",
			"create_time",
			"create_by",
			"module",
			"module_type",
			"type",
			"parent_id",
		}
	}
	data, err := c.callAPI(ctx, map[string]interface{}{
		"controller":  "c_note",
		"method":      "get_with_task_id",
		"db":          s.Database,
		"task_id":     taskID,
		"field_array": fields,
	})
	if err != nil {
		return
	}
	res := ResultSet{
		Fields: fields,
		Data:   data,
	}
	ret = make([]Note, res.Count())
	err = res.Unmarshal(
		func(index int) RecordUnmarshaler {
			ret[index].Database = s.Database
			return &ret[index]
		})
	return
}

// CreateNoteOption for CreateNote
type CreateNoteOption = func(map[string]interface{})

// CreateNoteOptionAccount set note created by account id.
func CreateNoteOptionAccount(id string) CreateNoteOption {
	return func(m map[string]interface{}) {
		m["#from_account_id"] = id
	}
}

// CreateNote for all task in selection.
func (s Selection) CreateNote(ctx context.Context, message Message, opts ...CreateNoteOption) (err error) {
	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}
	ids, err := s.resolveIDs(ctx)
	if err != nil {
		return
	}
	if len(ids) == 0 {
		return
	}

	paramData := map[string]interface{}{
		"module":      s.Module,
		"module_type": s.ModuleType,
		"#task_id":    strings.Join(ids, ","),
		"text":        message,
	}
	param := map[string]interface{}{
		"controller":       "c_note",
		"method":           "create",
		"db":               s.Database,
		"field_data_array": paramData,
	}
	for _, i := range opts {
		i(paramData)
	}
	if _, ok := paramData["#from_account_id"]; !ok {
		paramData["#from_account_id"], err = CurrentAccountID(ctx)
		if err != nil {
			return
		}
	}

	_, err = c.callAPI(ctx, param)
	if err != nil {
		return
	}
	return
}

// DeleteNote by id.
func (s Selection) DeleteNote(ctx context.Context, id ...string) (err error) {
	if len(id) == 0 {
		return

	}
	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}

	_, err = c.callAPI(ctx, map[string]interface{}{
		"controller":      "v_note",
		"method":          "del_in_id",
		"id_array":        id,
		"db":              s.Database,
		"module":          s.Module,
		"module_type":     s.ModuleType,
		"task_id_array":   []string{},
		"show_sign_array": []string{},
	})
	if err != nil {
		return
	}
	return
}
