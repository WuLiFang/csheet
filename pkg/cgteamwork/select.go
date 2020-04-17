package cgteamwork

import (
	"context"
	"strconv"
)

// Selection is a set of entry that match given criteria.
// No request send until `Values` called.
// See With* method for option descriptions.
type Selection struct {
	Database   string
	Module     string
	ModuleType string
	IDField    string
	Filter     Filter
	c          *Client
	Limit      int
}

// Values retrieves value from server.
func (s Selection) Values(ctx context.Context, names ...string) (ResultSet, error) {
	err := s.c.RefreshTokenOndemand(ctx)
	if err != nil {
		return ResultSet{}, err
	}
	if s.IDField != "" {
		names = append(names, s.IDField)
	}
	var limit = "5000"
	if s.Limit != 0 {
		limit = strconv.Itoa(s.Limit)
	}
	data, err := s.c.callAPI(
		ctx,
		map[string]interface{}{
			"controller":        "c_orm",
			"method":            "get_with_filter",
			"db":                s.Database,
			"module":            s.Module,
			"module_type":       s.ModuleType,
			"sign_array":        names,
			"sign_filter_array": s.Filter,
			"limit":             limit,
		},
	)
	return ResultSet{
		Fields: names,
		Data:   data,
	}, err
}

// Select all item in given module.
func (c *Client) Select(database, module string) Selection {
	idField := module + ".id"
	return Selection{
		Database:   database,
		Module:     module,
		ModuleType: "info",
		c:          c,
		Filter:     F(idField, "has", "%"),
		IDField:    idField,
	}
}

// WithFilter set filter for selection.
func (s Selection) WithFilter(v Filter) Selection {
	s.Filter = v
	return s
}

// WithModuleType set module type for selection, default: "info".
// Will set id field to known module type.
func (s Selection) WithModuleType(v string) Selection {
	s.ModuleType = v
	if v == "info" {
		s.IDField = s.Module + ".id"
	}
	if v == "task" {
		s.IDField = "task.id"
	}
	return s
}

// WithIDField set id field for selection, default: Module + ".id".
// IDField is alaways added to `Values` params.
// Set to empty string to disable this behavior.
func (s Selection) WithIDField(v string) Selection {
	s.IDField = v
	return s
}

// WithLimit set value limit for selection, server side limit is 5000.
// if limit is greater than 0, it will sent to server.
func (s Selection) WithLimit(v int) Selection {
	s.Limit = v
	return s
}
