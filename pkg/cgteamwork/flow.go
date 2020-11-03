package cgteamwork

import (
	"context"
	"encoding/json"
)

// UpdateFlow state for first task in selection
func (s Selection) UpdateFlow(ctx context.Context, field string, status string, message Message) (err error) {
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

	textData, err := json.Marshal(message)
	if err != nil {
		return
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
			"text":        string(textData),
		},
	)
	return
}
