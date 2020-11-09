package cgteamwork

import "context"

// Pipeline a task belongs to.
type Pipeline struct {
	ID          string
	Name        string
	Description string
	Database    string
	Module      Module
	// Order used when sort pipelines.
	Order string
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (p *Pipeline) UnmarshalCGTeamworkRecord(v map[string]string) error {
	p.ID = v["#id"]
	p.Name = v["entity_name"]
	p.Module.Name = v["module"]
	p.Module.Type = v["module_type"]
	p.Description = v["description"]
	p.Order = v["sort_id"]
	return nil
}

// PipelinesOption for customize Pipelines behavior.
type PipelinesOption func(payload map[string]interface{})

// PipelinesOptionFilter to specify filter.
func PipelinesOptionFilter(filter Filter) PipelinesOption {
	return func(payload map[string]interface{}) {
		payload["filter_array"] = filter
	}
}

// PipelinesOptionFields to select fields.
func PipelinesOptionFields(fields ...string) PipelinesOption {
	return func(payload map[string]interface{}) {
		payload["field_array"] = fields
	}
}

// Pipelines from server, returns all pipeline by default.
func Pipelines(ctx context.Context, db string, opts ...PipelinesOption) (ret []Pipeline, err error) {
	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}

	var payload = map[string]interface{}{
		"db":         db,
		"controller": "c_pipeline",
		"method":     "get_with_filter",
		"field_array": []string{
			"#id",
			"entity_name",
			"module",
			"module_type",
			"description",
			"sort_id",
		},
		"filter_array": F("#id").Has("%"),
	}
	for _, i := range opts {
		i(payload)
	}

	res, err := c.callAPI(
		ctx,
		payload,
	)
	if err != nil {
		return
	}
	rs := ResultSet{
		Fields: payload["field_array"].([]string),
		Data:   res,
	}
	ret = make([]Pipeline, rs.Count())
	err = rs.Unmarshal(func(index int) RecordUnmarshaler {
		ret[index].Database = db
		return &ret[index]
	})
	if err != nil {
		return
	}

	return

}
