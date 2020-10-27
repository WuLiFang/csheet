package cgteamwork

import (
	"context"
	"encoding/json"
)

// UpdateFlow state for first task in selection
func (s Selection) UpdateFlow(ctx context.Context, field string, status string, note string) (err error) {
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
		return ErrEmptySelection
	}

	text := ""
	if note != "" {
		// no image upload support for now yet
		var textData []byte
		textData, err = json.Marshal(map[string]interface{}{"data": note, "image": []string{}})
		if err != nil {
			return err
		}
		text = string(textData)
	}
	_, err = c.callAPI(
		ctx,
		map[string]interface{}{
			"controller":  "c_work_flow",
			"method":      "python_update_flow",
			"db":          s.Database,
			"module":      s.Module,
			"module_type": s.ModuleType,
			"task_id":     ids[0],
			"field_sign":  field,
			"status":      status,
			"text":        text,
		},
	)
	return err
}
