package cgteamwork

import (
	"fmt"

	"github.com/tidwall/gjson"
)

// ResultSet store query result.
type ResultSet struct {
	Fields []string
	Data   gjson.Result
	d      map[string]string
}

// Count data rows.
func (rs ResultSet) Count() int {
	return int(rs.Data.Get("#").Int())
}

// SetDefault data that will used when unmarshal
func (rs *ResultSet) SetDefault(k, v string) {
	if v == "" {
		delete(rs.d, k)
		return
	}
	if rs.d == nil {
		rs.d = make(map[string]string)
	}
	rs.d[k] = v
}

// RecordUnmarshaler allow unmarshal from a result set row
type RecordUnmarshaler interface {
	UnmarshalCGTeamworkRecord(data map[string]string) error
}

// ForEach iterate through all data in map form.
func (rs ResultSet) ForEach(fn func(index int, data map[string]string) error) error {
	rowCount := rs.Count()
	for row := 0; row < rowCount; row++ {
		data := map[string]string{}
		for k, v := range rs.d {
			data[k] = v
		}
		for col, name := range rs.Fields {
			data[name] = rs.Data.Get(fmt.Sprintf("%d.%d", row, col)).String()
		}
		err := fn(row, data)
		if err != nil {
			return err
		}
	}
	return nil
}

// Unmarshal iterate through all data in map form.
func (rs ResultSet) Unmarshal(fn func(index int) RecordUnmarshaler) error {
	rowCount := rs.Count()
	for row := 0; row < rowCount; row++ {
		ptr := fn(row)
		if ptr == nil {
			continue
		}
		data := map[string]string{}
		for k, v := range rs.d {
			data[k] = v
		}
		for col, name := range rs.Fields {
			data[name] = rs.Data.Get(fmt.Sprintf("%d.%d", row, col)).String()
		}
		err := ptr.UnmarshalCGTeamworkRecord(data)
		if err != nil {
			return err
		}
	}
	return nil
}

// Field data
func (rs ResultSet) Field(field string) []gjson.Result {
	var index = -1
	for i, v := range rs.Fields {
		if v == field {
			index = i
			break
		}
	}
	if index < 0 {
		return nil
	}
	return rs.Data.Get(fmt.Sprintf("#.%d", index)).Array()
}
