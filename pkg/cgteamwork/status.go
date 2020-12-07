package cgteamwork

import (
	"context"
)

// Status of a Task on given FlowStage
type Status struct {
	ID    string
	Name  string
	Type  string
	Color string
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (f *Status) UnmarshalCGTeamworkRecord(v map[string]string) error {
	f.ID = v["#id"]
	f.Name = v["status"]
	f.Type = v["status_type"]
	f.Color = v["color"]
	return nil
}

// Statuses returns all status
func Statuses(ctx context.Context) (ret []Status, err error) {
	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}
	fields := []string{
		"#id", "status", "status_type", "color",
	}
	res, err := c.callAPI(
		ctx,
		map[string]interface{}{
			"controller":  "c_status",
			"method":      "get_all",
			"field_array": fields,
		},
	)
	if err != nil {
		return
	}
	rs := ResultSet{
		Fields: fields,
		Data:   res,
	}
	ret = make([]Status, rs.Count())
	err = rs.Unmarshal(func(index int) RecordUnmarshaler {
		return &ret[index]
	})
	return
}
