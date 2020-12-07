package cgteamwork

import (
	"context"
	"encoding/json"
	"net/url"
	"strings"

	"github.com/tidwall/gjson"
)

// FlowStage in a Flow
type FlowStage struct {
	Name       string
	Field      Field
	Statuses   []Status
	Inspectors []User
}

// Flow for a pipeline
type Flow struct {
	ID       string
	Name     string
	Pipeline Pipeline
	Stages   []FlowStage
}

// Flows for selected module
func (s Selection) Flows(ctx context.Context) (ret []Flow, err error) {
	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}
	res, err := c.getJSON(
		ctx,
		"index.php",
		&url.Values{
			"controller":  {"v_flow"},
			"method":      {"get_all_data"},
			"db":          {s.Database},
			"module":      {s.Module},
			"module_type": {s.ModuleType},
		},
	)
	if err != nil {
		return
	}

	statuses, err := Statuses(ctx)
	if err != nil {
		return
	}
	var statusIDs = map[string]struct{}{}
	for _, i := range statuses {
		statusIDs[i.ID] = struct{}{}
	}

	res.Get("flow_data").ForEach(func(_, flowData gjson.Result) bool {
		var flow = Flow{
			ID:   flowData.Get("flow_id").String(),
			Name: flowData.Get("flow_name").String(),
			Pipeline: Pipeline{
				ID:   flowData.Get("pipeline_id").String(),
				Name: flowData.Get("pipeline_name").String(),
			},
		}
		flowData.Get("qc_data_list").ForEach(func(_, stageData gjson.Result) bool {
			var stage = FlowStage{
				Name: stageData.Get("qc_status").String(),
				Field: Field{
					Database: s.Database,
					ID:       stageData.Get("set_field_id").String(),
				},
			}

			// inspectors
			var inspectorIDs = strings.Split(stageData.Get("qc_data.account_id").String(), ",")
			for _, id := range inspectorIDs {
				var user = User{ID: id}
				stage.Inspectors = append(stage.Inspectors, user)
			}

			stageData.Get("qc_data.status_data_list").ForEach(func(_, statusData gjson.Result) bool {
				var status = Status{
					ID:   statusData.Get("status_id").String(),
					Name: statusData.Get("name").String(),
					Type: statusData.Get("type").String(),
				}
				if _, ok := statusIDs[status.ID]; !ok {
					// skip dangling status that already deleted.
					return true
				}
				stage.Statuses = append(stage.Statuses, status)
				return true
			})
			flow.Stages = append(flow.Stages, stage)
			return true
		})
		ret = append(ret, flow)
		return true
	})
	return
}

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
