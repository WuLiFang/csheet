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
	Limit      int
}

// Count retrieves entries count from server.
func (s Selection) Count(ctx context.Context) (int, error) {
	c := ClientFor(ctx)
	err := c.RefreshTokenOndemand(ctx)
	if err != nil {
		return 0, err
	}
	data, err := c.callAPI(
		ctx,
		map[string]interface{}{
			"controller":        "c_orm",
			"method":            "get_count_with_filter",
			"db":                s.Database,
			"module":            s.Module,
			"module_type":       s.ModuleType,
			"sign_filter_array": s.Filter,
		},
	)
	return int(data.Int()), err
}

func stringSliceContains(source []string, target string) bool {
	for _, i := range source {
		if i == target {
			return true
		}
	}
	return false
}

// Values retrieves value from server.
func (s Selection) Values(ctx context.Context, names ...string) (ResultSet, error) {
	c := ClientFor(ctx)
	err := c.RefreshTokenOndemand(ctx)
	if err != nil {
		return ResultSet{}, err
	}
	if s.IDField != "" && !stringSliceContains(names, s.IDField) {
		names = append(names, s.IDField)
	}
	var limit = "5000"
	if s.Limit != 0 {
		limit = strconv.Itoa(s.Limit)
	}
	data, err := c.callAPI(
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

func (s Selection) resolveIDs(ctx context.Context) ([]string, error) {
	if s.Filter.Chain == nil && s.Filter.Left == s.IDField {
		switch s.Filter.Op {
		case "in":
			if v, ok := s.Filter.Right.([]string); ok {
				return v, nil
			}

		case "=":
			if v, ok := s.Filter.Right.(string); ok {
				return []string{v}, nil
			}
		}
	}

	res, err := s.Values(ctx)
	if err != nil {
		return nil, err
	}
	data := res.Field(s.IDField)
	ret := make([]string, 0, len(data))
	for _, i := range data {
		ret = append(ret, i.String())
	}
	return ret, nil
}

// Select all item in given module.
func Select(database, module string) Selection {
	idField := module + ".id"
	return Selection{
		Database:   database,
		Module:     module,
		ModuleType: "info",
		Filter:     F(idField).Has("%"),
		IDField:    idField,
	}
}

// WithFilter set filter for selection.
func (s Selection) WithFilter(v Filter) Selection {
	if (v == Filter{}) {
		return s
	}
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
