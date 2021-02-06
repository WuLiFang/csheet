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

// FieldOptions for field related operations
type FieldOptions struct {
	filter Filter
	fields []string
}

// FieldOption mutate FieldOptions
type FieldOption = func(opts *FieldOptions)

// FieldOptionFilter to specify filter.
func FieldOptionFilter(f Filter) FieldOption {
	return func(opts *FieldOptions) {
		opts.filter = f
	}
}

// TODO: use spread args

// FieldOptionFields to select wanted fields.
func FieldOptionFields(v []string) FieldOption {
	return func(opts *FieldOptions) {
		opts.fields = v
	}
}

var allFieldFields = []string{
	"#id", "module", "sign",
	"type", "field_str", "is_sys",
	"see_permission", "edit_permission",
	"is_required", "lock", "edit_is_show",
	"sort_id",
}

// Fetch field data by id.
func (f *Field) Fetch(ctx context.Context, opts ...FieldOption) (err error) {
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
	var args = new(FieldOptions)
	for _, o := range opts {
		o(args)
	}
	var fields = allFieldFields
	if args.fields != nil {
		fields = args.fields
	}
	var payload = map[string]interface{}{
		"controller":  "c_field",
		"method":      "get_in_id",
		"db":          f.Database,
		"field_array": fields,
		"id_array":    []string{f.ID},
	}
	res, err := c.callAPI(
		ctx,
		payload,
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

// Fields from server.
func Fields(ctx context.Context, db string, opts ...FieldOption) (ret []Field, err error) {
	c := ClientFor(ctx)
	err = c.RefreshTokenOndemand(ctx)
	if err != nil {
		return
	}
	var args = new(FieldOptions)
	for _, o := range opts {
		o(args)
	}
	var fields = allFieldFields
	if args.fields != nil {
		fields = args.fields
	}
	var payload = map[string]interface{}{
		"db":           db,
		"controller":   "c_field",
		"method":       "get_with_filter",
		"field_array":  fields,
		"filter_array": F("#id").Has("%"),
	}
	if !args.filter.IsZero() {
		payload["filter_array"] = args.filter
	}
	res, err := c.callAPI(ctx, payload)
	if err != nil {
		return
	}
	rs := ResultSet{
		Fields: fields,
		Data:   res,
	}
	ret = make([]Field, rs.Count())
	err = rs.Unmarshal(func(index int) RecordUnmarshaler {
		ret[index].Database = db
		return &ret[index]
	})
	if err != nil {
		return
	}
	return
}
