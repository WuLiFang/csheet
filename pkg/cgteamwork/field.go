package cgteamwork

import (
	"context"
	"errors"
	"strings"
)

// Field in table view
type Field struct {
	Database        string
	ID              string
	Sign            FieldSign
	Module          Module
	Type            string
	Label           string
	IsSystem        bool
	IsRequired      bool
	IsLocked        bool
	IsEditable      bool
	Order           string
	ReadPermission  []string
	WritePermission []string
}

// UnmarshalCGTeamworkRecord implement RecordUnmarshaler
func (f *Field) UnmarshalCGTeamworkRecord(v map[string]string) error {
	f.ID = v["#id"]
	f.Module.Name = v["module"]
	f.Sign = FieldSign(v["sign"])
	f.Type = v["type"]
	f.Label = v["field_str"]
	f.IsSystem = v["is_sys"] == "Y"
	f.IsRequired = v["is_required"] == "Y"
	f.IsLocked = v["lock"] == "Y"
	f.IsEditable = v["edit_is_show"] == "Y"
	f.Order = v["sort_id"]
	f.ReadPermission = strings.Split(v["see_permission"], ",")
	f.WritePermission = strings.Split(v["edit_permission"], ",")
	return nil
}

// Fetch field data by id.
func (f *Field) Fetch(ctx context.Context) (err error) {
	if f.Database == "" {
		err = errors.New("cgteamwork: Field: Fetch: empty database")
		return
	}
	if f.ID == "" {
		err = errors.New("cgteamwork: Field: Fetch: empty id")
		return
	}
	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}
	fields := []string{
		"#id", "module", "sign",
		"type", "field_str", "is_sys",
		"see_permission", "edit_permission",
		"is_required", "lock", "edit_is_show",
		"sort_id",
	}
	res, err := c.callAPI(
		ctx,
		map[string]interface{}{
			"controller":  "c_field",
			"method":      "get_in_id",
			"db":          f.Database,
			"field_array": fields,
			"id_array":    []string{f.ID},
		},
	)
	if err != nil {
		return
	}
	rs := ResultSet{
		Fields: fields,
		Data:   res,
	}
	err = rs.Unmarshal(func(index int) RecordUnmarshaler {
		return f
	})
	return
}
